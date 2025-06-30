import Image from 'next/image';
import styles from './logo.module.css'; // Import as styles (not a plain CSS file)

export default function RotatingLogo() {
  return (
    <Image
      src="/slogan.gif"
      alt="Logo"
      width={35}
      height={35}
      className={styles['rotate-infinite']} //  Apply from imported styles
    />
  );
}

