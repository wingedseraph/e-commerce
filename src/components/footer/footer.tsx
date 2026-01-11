import styles from '@components/footer/footer.module.scss';

const GITHUBS_LINKS = [
  { href: 'https://github.com/madsok', text: '@madsok' },
  { href: 'https://github.com/YuliAdam', text: '@YuliAdam' },
  { href: 'https://github.com/wingedseraph', text: '@wingedseraph' },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      {GITHUBS_LINKS.map(item => {
        return (
          <a key={item.text} className={styles.footer_title} href={item.href}>
            {item.text}
          </a>
        );
      })}
    </footer>
  );
}
