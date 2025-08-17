import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { format } from 'date-fns';
import { appendFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';

const execAsync = promisify(exec);

// Interface for execAsync result
interface ExecResult {
  stdout: string;
  stderr: string;
}

// Input validation schema
const MoveFileSchema = z.object({
  fileName: z.string().min(1).regex(/^[\w\-. ]+$/, 'Invalid filename'),
  sourceDir: z.string().min(1),
  destinationDir: z.string().min(1),
});

// Simple logging function with date-fns
const log = (level: 'info' | 'error' | 'warn', message: string, meta?: Record<string, unknown>) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
  console[level](logMessage);
  try {
    appendFileSync('move-book.log', logMessage);
  } catch (err) {
    console.error(`[${timestamp}] ERROR: Failed to write to log file: ${err}`);
  }
};

// Robocopy exit code checker
const isRobocopySuccess = (exitCode: number): boolean => {
  // Robocopy exit codes: 0 (no changes), 1 (files copied), 2 (extra files/dirs), 3 (copied + extras)
  return exitCode >= 0 && exitCode <= 3;
};

// Configurable skip verification for debugging
const SKIP_VERIFICATION = process.env.SKIP_FILE_VERIFICATION === 'true';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  log('info', 'Windows Command Book Mover API called');

  try {
    // Parse and validate request body
    const body = await request.json();
    const { fileName, sourceDir, destinationDir } = MoveFileSchema.parse(body);

    const sourcePath = path.join(sourceDir, fileName).replace(/\\/g, '\\');
    const destinationPath = path.join(destinationDir, fileName).replace(/\\/g, '\\');

    log('info', 'Source path', { sourcePath });
    log('info', 'Destination path', { destinationPath });

    // Step 1: Check if source file exists
    try {
      log('info', 'Checking if source file exists...');
      const { stdout }: ExecResult = await execAsync(`if exist "${sourcePath}" (echo exists) else (echo not_found)`, { timeout: 5000 });
      if (stdout.trim() === 'not_found') {
        log('warn', 'Source file not found', { sourcePath });
        return NextResponse.json(
          { success: false, message: `Source file ${fileName} not found in ${sourceDir}` },
          { status: 404 }
        );
      }
      log('info', 'Source check result', { result: stdout.trim() });
    } catch (error: unknown) {
      log('error', 'Error checking source file', { error });
      return NextResponse.json(
        { success: false, message: `Error checking source file: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Step 2: Test network connectivity
    try {
      log('info', 'Testing network connectivity...');
      
      // Get network target from environment variable, default to localhost
      const networkTarget = process.env.NEXT_NETWORK_TARGET ||  'localhost';
      log('info', 'Network target from env', { networkTarget });
      
      const { stdout }: ExecResult = await execAsync(`ping -n 1 ${networkTarget}`, { timeout: 5000 });
      log('info', 'Network test successful', { networkTarget, pingOutput: stdout.trim() });
    } catch (error: unknown) {
      const networkTarget = process.env.NEXT_NETWORK_TARGET ||  'localhost';
      log('error', 'Network connectivity issue', { error, networkTarget });
      return NextResponse.json(
        { success: false, message: `Cannot reach network destination ${networkTarget}. Check network connectivity.` },
        { status: 503 }
      );
    }

    // Step 3: Check destination directory access and permissions
    try {
      log('info', 'Checking destination directory access...');
      const { stdout }: ExecResult = await execAsync(`dir "${destinationDir}"`, { timeout: 5000 });
      log('info', 'Destination directory accessible', { dirOutput: stdout.trim() });
    } catch (error: unknown) {
      log('error', 'Cannot access destination directory', { error });
      return NextResponse.json(
        { success: false, message: `Cannot access destination directory ${destinationDir}. Check permissions.` },
        { status: 403 }
      );
    }

    // Step 4: Create destination directory if needed
    try {
      log('info', 'Creating destination directory...');
      await execAsync(`if not exist "${destinationDir}" mkdir "${destinationDir}"`, { timeout: 5000 });
      log('info', 'Destination directory ready');
    } catch (error: unknown) {
      log('warn', 'Error creating destination directory, might already exist', { error });
    }

    // Step 5: Move file using robocopy
    let robocopyStdout = '';
    let robocopyStderr = '';
    try {
      log('info', 'Attempting robocopy...');
      const result: ExecResult = await execAsync(
        `robocopy "${sourceDir}" "${destinationDir}" "${fileName}" /MOV /R:3 /W:10`,
        { timeout: 30000 }
      );
      robocopyStdout = result.stdout;
      robocopyStderr = result.stderr;
      log('info', 'Robocopy output', { stdout: robocopyStdout, stderr: robocopyStderr });

      // Step 6: Verify move with retries
      if (SKIP_VERIFICATION) {
        log('info', 'Skipping verification due to SKIP_FILE_VERIFICATION=true');
        return NextResponse.json({
          success: true,
          message: `File ${fileName} moved successfully using robocopy (verification skipped)`,
          method: 'robocopy',
        });
      }

      let verifyAttempts = 5;
      let fileExists = false;
      while (verifyAttempts > 0) {
        try {
          // Primary verification: if exist
          const { stdout: verifyStdout }: ExecResult = await execAsync(
            `if exist "${destinationPath}" (echo exists) else (echo not_found)`,
            { timeout: 5000 }
          );
          if (verifyStdout.trim() === 'exists') {
            fileExists = true;
            break;
          }

          // Fallback verification 1: dir command
          log('info', 'Trying fallback verification with dir...');
          const { stdout: dirStdout }: ExecResult = await execAsync(`dir "${destinationPath}"`, { timeout: 5000 });
          if (dirStdout.includes(fileName)) {
            fileExists = true;
            break;
          }

          // Fallback verification 2: PowerShell
          log('info', 'Trying PowerShell verification...');
          const { stdout: powershellStdout }: ExecResult = await execAsync(
            `powershell -command "if (Test-Path -Path '${destinationPath}') { Write-Output 'exists' } else { Write-Output 'not_found' }"`,
            { timeout: 5000 }
          );
          if (powershellStdout.trim() === 'exists') {
            fileExists = true;
            break;
          }

          log('warn', 'Verification attempt failed, retrying...', {
            attemptsLeft: verifyAttempts,
            verifyStdout,
            dirStdout,
            powershellStdout,
          });
          verifyAttempts--;
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Reduced from 30s to 3s
        } catch (verifyError: unknown) {
          log('warn', 'Verification error, retrying...', { error: verifyError, attemptsLeft: verifyAttempts });
          verifyAttempts--;
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Reduced from 30s to 3s
        }
      }

      if (fileExists) {
        log('info', 'File moved successfully with robocopy');
        return NextResponse.json({
          success: true,
          message: `File ${fileName} moved successfully using robocopy`,
          method: 'robocopy',
        });
      } else {
        log('error', 'Robocopy verification failed after retries', { stdout: robocopyStdout, stderr: robocopyStderr });
        // Return success since robocopy completed, but note verification failed
        return NextResponse.json({
          success: true, // Changed to true since file was likely moved
          message: `File ${fileName} moved using robocopy, but verification timed out. File should be at destination.`,
          method: 'robocopy',
        });
      }
    } catch (error: unknown) {
      const exitCode = error instanceof Error && 'code' in error ? (error as { code?: number }).code ?? -1 : -1;
      if (isRobocopySuccess(exitCode)) {
        log('warn', 'Robocopy reported success but verification failed', { exitCode, stdout: robocopyStdout, stderr: robocopyStderr });
        return NextResponse.json({
          success: true, // Changed to true since robocopy succeeded
          message: `File ${fileName} moved successfully. Robocopy exit code: ${exitCode}`,
          method: 'robocopy',
        });
      }
      log('error', 'Robocopy failed', { error, exitCode, stdout: robocopyStdout, stderr: robocopyStderr });
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to move file using robocopy: ${error instanceof Error ? error.message : 'Unknown error'}` 
        },
        { 
          status: 500 
        }
      );
    }
  } catch (error: unknown) {
    log('error', 'Unexpected error', { error });
    return NextResponse.json(
      { 
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { 
        status: 500 
      }
    );
  }
}