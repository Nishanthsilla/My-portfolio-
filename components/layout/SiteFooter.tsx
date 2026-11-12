import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer} id="contact">
      <p className="placeholder">[Placeholder] Contact details and social links</p>
      <p className={styles.small}>© [Year] [Your Name]</p>
    </footer>
  );
}
