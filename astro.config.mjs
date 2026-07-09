// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import mermaid from 'astro-mermaid';

// GitHub Pages (project site) 用の設定
// https://takenori-kusaka.github.io/process-compass/
export default defineConfig({
  site: 'https://takenori-kusaka.github.io',
  base: '/process-compass',
  integrations: [
    // mermaid は starlight より先に登録する(コードブロック処理の順序のため)
    // securityLevel: 'loose' は click ディレクティブ(図からのドリルダウン遷移)に必要 — ADR-0006
    mermaid({ autoTheme: true, mermaidConfig: { securityLevel: 'loose' } }),
    starlight({
      // ビルド時に内部リンク切れを検出する(外部リンクは週次の link-check.yml で検査)
      plugins: [starlightLinksValidator()],
      title: 'Process Compass',
      description:
        '生成AI時代の開発プロセスを体系化し、チーム体制や事業フェーズに合わせて最適なプロセスを提案する羅針盤',
      // 日本語をルートロケールとし、将来の英語版追加(locales.en)に備える
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Takenori-Kusaka/process-compass',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/Takenori-Kusaka/process-compass/edit/main/',
      },
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://takenori-kusaka.github.io/process-compass/og-image.png',
          },
        },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://takenori-kusaka.github.io/process-compass/og-image.png',
          },
        },
      ],
      sidebar: [
        { label: 'ビジョン', items: [{ autogenerate: { directory: 'vision' } }] },
        {
          label: 'フェーズ1: 現状調査',
          items: [
            { autogenerate: { directory: 'phase1-current-state' } },
            {
              label: 'プロセス体系(データ駆動)',
              items: [
                { label: '一覧', link: '/processes/' },
                { label: 'ウォーターフォール', link: '/processes/waterfall/' },
                { label: 'アジャイル', link: '/processes/agile/' },
                { label: 'スクラム', link: '/processes/scrum/' },
                { label: 'テスト駆動開発(TDD)', link: '/processes/tdd/' },
                { label: 'ドメイン駆動設計(DDD)', link: '/processes/ddd/' },
                { label: 'ハイブリッド開発の実態', link: '/processes/hybrid/' },
              ],
            },
          ],
        },
        { label: 'フェーズ2: AIDLC・理想形調査', items: [{ autogenerate: { directory: 'phase2-aidlc' } }] },
        { label: 'フェーズ3: ギャップ分析', items: [{ autogenerate: { directory: 'phase3-gap-analysis' } }] },
        { label: 'フェーズ4: 詳細プロセス策定', items: [{ autogenerate: { directory: 'phase4-process-design' } }] },
        { label: 'フェーズ5: プロセス実装', items: [{ autogenerate: { directory: 'phase5-implementation' } }] },
        { label: 'フェーズ6: プロセス運用', items: [{ autogenerate: { directory: 'phase6-operation' } }] },
        { label: 'コミュニティ', items: [{ autogenerate: { directory: 'community' } }] },
        { label: '決定記録(ADR)', collapsed: true, items: [{ autogenerate: { directory: 'adr' } }] },
      ],
    }),
  ],
});
