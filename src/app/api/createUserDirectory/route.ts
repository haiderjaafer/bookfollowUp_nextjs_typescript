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
const CreateDirectorySchema = z.object({
  username: z.string().min(1).regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
});

// Simple logging function
const log = (level: 'info' | 'error' | 'warn', message: string, meta?: Record<string, unknown>) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}${meta ? ` ${JSON.stringify(meta)}` : ''}\n`;
  console[level](logMessage);
  try {
    appendFileSync('create-user-directory.log', logMessage);
  } catch (err) {
    console.error(`[${timestamp}] ERROR: Failed to write to log file: ${err}`);
  }
};

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  log('info', 'Create User Directory API called');

  try {
    // Parse and validate request body
    const body = await request.json();
    const { username } = CreateDirectorySchema.parse(body);

    //const baseDir = '\\\\10.20.11.33\\booksFollowUp\\pdfScanner';

    //const baseDir = 'D:\\booksFollowUp\\pdfScanner';

    const baseDir = process.env.NEXT_PUBLIC_BASE_DIR_USER_DIRECTORY ;

    if (!baseDir) {
       throw new Error("Environment variable NEXT_PUBLIC_BASE_DIR_USER_DIRECTORY is not set.");
        }
    
    const userDir = path.join(baseDir, username).replace(/\\/g, '\\');

    log('info', 'Creating user directory', { userDir });

    // Step 1: Check if directory already exists
    try {
      const { stdout }: ExecResult = await execAsync(
        `if exist "${userDir}" (echo exists) else (echo not_found)`,
        { timeout: 5000 }
      );
      if (stdout.trim() === 'exists') {
        log('info', 'User directory already exists', { userDir });
        return NextResponse.json(
          { success: true, message: `Directory for ${username} already exists` },
          { status: 200 }
        );
      }
    } catch (error: unknown) {
      log('warn', 'Error checking directory existence', { error });
    }

    // Step 2: Test network connectivity
    try {
      log('info', 'Testing network connectivity...');
      const { stdout }: ExecResult = await execAsync(`ping -n 1 localhost`, { timeout: 5000 });
      log('info', 'Network test successful', { pingOutput: stdout.trim() });
    } catch (error: unknown) {
      log('error', 'Network connectivity issue', { error });
      return NextResponse.json(
        { success: false, message: 'Cannot reach network destination 10.20.11.33. Check network connectivity.' },
        { status: 503 }
      );
    }

    // Step 3: Check base directory access
    try {
      log('info', 'Checking base directory access...');
      const { stdout }: ExecResult = await execAsync(`dir "${baseDir}"`, { timeout: 5000 });
      log('info', 'Base directory accessible', { dirOutput: stdout.trim() });
    } catch (error: unknown) {
      log('error', 'Cannot access base directory', { error });
      return NextResponse.json(
        { success: false, message: `Cannot access base directory ${baseDir}. Check permissions.` },
        { status: 403 }
      );
    }

    // Step 4: Create user directory
    try {
      log('info', 'Creating user directory...');
      await execAsync(`mkdir "${userDir}"`, { timeout: 5000 });
      log('info', 'User directory created successfully', { userDir });

      // Verify directory creation
      const { stdout: verifyStdout }: ExecResult = await execAsync(
        `if exist "${userDir}" (echo exists) else (echo not_found)`,
        { timeout: 5000 }
      );
      if (verifyStdout.trim() !== 'exists') {
        log('error', 'Failed to verify user directory creation', { userDir, verifyStdout });
        throw new Error('Directory created but not found during verification');
      }

      return NextResponse.json(
        { success: true, message: `Directory for ${username} created successfully` },
        { status: 201 }
      );
    } catch (error: unknown) {
      log('error', 'Failed to create user directory', { error, userDir });
      return NextResponse.json(
        { success: false, message: `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      log('error', 'Invalid input', { issues: error.issues });
      return NextResponse.json(
        { success: false, message: 'Invalid username format. Use alphanumeric characters only.' },
        { status: 400 }
      );
    }
    log('error', 'Unexpected error', { error });
    return NextResponse.json(
      { success: false, message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}