// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// GitHub Pages (project site) 用の設定
// https://takenori-kusaka.github.io/process-compass/
export default defineConfig({
  site: 'https://takenori-kusaka.github.io',
  base: '/process-compass',
  integrations: [
    starlight({
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
      sidebar: [
        { label: 'ビジョン', autogenerate: { directory: 'vision' } },
        { label: 'フェーズ1: 現状調査', autogenerate: { directory: 'phase1-current-state' } },
        { label: 'フェーズ2: AIDLC・理想形調査', autogenerate: { directory: 'phase2-aidlc' } },
        { label: 'フェーズ3: ギャップ分析', autogenerate: { directory: 'phase3-gap-analysis' } },
        { label: 'フェーズ4: 詳細プロセス策定', autogenerate: { directory: 'phase4-process-design' } },
        { label: 'フェーズ5: プロセス実装', autogenerate: { directory: 'phase5-implementation' } },
        { label: 'フェーズ6: プロセス運用', autogenerate: { directory: 'phase6-operation' } },
        { label: 'コミュニティ', autogenerate: { directory: 'community' } },
      ],
    }),
  ],
});
