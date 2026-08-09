// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import mermaid from 'astro-mermaid';
import sitemap from '@astrojs/sitemap';

// GitHub Pages (project site) 用の設定
// https://takenori-kusaka.github.io/process-compass/
export default defineConfig({
  site: 'https://takenori-kusaka.github.io',
  base: '/process-compass',
  integrations: [
    sitemap(),
    // mermaid は starlight より先に登録する(コードブロック処理の順序のため)
    // securityLevel: 'loose' は click ディレクティブ(図からのドリルダウン遷移)に必要 — ADR-0006
    mermaid({ autoTheme: true, mermaidConfig: { securityLevel: 'loose' } }),
    starlight({
      // ビルド時に内部リンク切れを検出する(外部リンクは週次の link-check.yml で検査)
      // /processes/ 配下はカスタム Astro ページ(スキーマ駆動生成)で Starlight の
      // ページ集合に含まれないため、検証対象から除外する
      // /tool/simulator/ もカスタムページのため検証対象から除外する
      plugins: [
        starlightLinksValidator({
          exclude: [
            '/process-compass/processes/**',
            '/process-compass/phase4-process-design/process-model/**',
            '/process-compass/tool/simulator/',
          ],
        }),
      ],
      title: 'Process Compass（プロセスコンパス）',
      description:
        '生成AI時代の開発プロセス「ピットイン方式/ピットイン開発」を体系化し、チーム体制や事業フェーズに合わせて最適なプロセスを提案する羅針盤',
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
              // 既存プロセスの調査結果のみを置く。本プロジェクトの提案(ピットイン方式
              // 参照モデル)はフェーズ4の直前に独立したセクションとして分離した(ADR-0017)
              label: '既存プロセスの体系(データ駆動)',
              items: [
                { label: '一覧', link: '/processes/' },
                { label: '横断比較表', link: '/processes/comparison/' },
                { label: 'ウォーターフォール', link: '/processes/waterfall/' },
                { label: 'アジャイル', link: '/processes/agile/' },
                { label: 'スクラム', link: '/processes/scrum/' },
                { label: 'テスト駆動開発(TDD)', link: '/processes/tdd/' },
                { label: 'ドメイン駆動設計(DDD)', link: '/processes/ddd/' },
                { label: 'イベント駆動', link: '/processes/event-driven/' },
                { label: '仕様駆動開発(SDD)', link: '/processes/sdd/' },
                { label: 'AIDLC', link: '/processes/aidlc/' },
                { label: 'ハイブリッド開発の実態', link: '/processes/hybrid/' },
              ],
            },
          ],
        },
        { label: 'フェーズ2: AIDLC・理想形調査', items: [{ autogenerate: { directory: 'phase2-aidlc' } }] },
        { label: 'フェーズ3: ギャップ分析', items: [{ autogenerate: { directory: 'phase3-gap-analysis' } }] },
        {
          // ピットイン方式参照モデルは本標準の一部(構造の側)であり、フェーズ4の内側へ置く。
          // 独立セクションとして外に出す構成は ADR-0020 で置き換えた
          label: 'フェーズ4: 詳細プロセス策定',
          items: [
            {
              label: '★ ピットイン方式参照モデル(構造)',
              link: '/phase4-process-design/process-model/',
            },
            { autogenerate: { directory: 'phase4-process-design' } },
          ],
        },
        { label: 'フェーズ5: プロセス実装', items: [{ autogenerate: { directory: 'phase5-implementation' } }] },
        { label: 'フェーズ6: プロセス運用', items: [{ autogenerate: { directory: 'phase6-operation' } }] },
        {
          label: 'プロセス提案ツール',
          items: [
            { label: '★ シミュレーター(プロトタイプ)', link: '/tool/simulator/' },
            { autogenerate: { directory: 'tool' } },
          ],
        },
        { label: 'コミュニティ', items: [{ autogenerate: { directory: 'community' } }] },
        { label: '決定記録(ADR)', collapsed: true, items: [{ autogenerate: { directory: 'adr' } }] },
      ],
    }),
  ],
});
