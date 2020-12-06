import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Black Mirror</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Hello!
        </h1>
        <iframe width="875" height="543" seamless frameBorder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQjWkt0Rv0cVHLPg1v42h34_BXBPO9e60cziNzlVXgUJ2dxTb0GRAim38q49AkK-e2TAlc12PavJpni/pubchart?oid=1470868663&amp;format=interactive"></iframe>
      </main>

      <footer className={styles.footer}>
        Footer
      </footer>
    </div>
  )
}
