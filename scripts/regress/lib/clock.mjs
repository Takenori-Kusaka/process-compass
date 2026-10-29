// 回帰の試験の時計(#319 裁定 R-3)。
//
// NODE_OPTIONS=--import でこのモジュールを先に読み込ませ、Date を REGRESS_NOW の時刻で止める。
// NODE_OPTIONS は環境変数なので、試験のスクリプトが起動する子プロセス(generate-profile.mjs・
// check-d0.mjs など)にも届く。git の時刻は、走らせる側が GIT_AUTHOR_DATE・GIT_COMMITTER_DATE で同じ時刻にそろえる。
//
// 時計は「止めた時刻から、決まった刻みで進む論理の時計」である。試験の補助(suite/lib.mjs)は、子プロセスを
// 起動するたびに 1 秒進め、進めた時刻を REGRESS_NOW・GIT_AUTHOR_DATE・GIT_COMMITTER_DATE で子へ渡し、自分の時計も
// __REGRESS_CLOCK_SET__ で同じ時刻へ合わせる。実時間に依らないので、誰がいつ流しても同じ時刻の列になる。
// 1 つの時刻に止めきらないのは、テンプレートがコミットの前後(封じた後に見つける者の記録を入れた、など)を
// コミットの時刻で比べるためである(#319 の移植で、全部のコミットを同じ時刻にすると trial の 6 場面が落ちた)。
//
// 止めるもの: 引数なしの new Date()、Date()、Date.now()。引数つきの new Date(x)・Date.parse・Date.UTC は元のまま。
// 止まらないもの: 引数なしの Intl.DateTimeFormat().format() / formatToParts()(V8 が JS の Date を経ずに時刻を読む)。
//   テンプレートがこれを使わないことは、run.mjs が走らせる前に確かめる。performance.now()・process.hrtime も止めない。
//
// テンプレートには時刻を差し替える入口を足さない(裁定 R-3。K65 の回避経路になり、統制の弱化に当たる)。
// この先読みは試験の側だけにある。

const NOW = process.env.REGRESS_NOW;
if (!NOW) throw new Error('clock.mjs: REGRESS_NOW が無い(回帰の試験は時計を止めて流す)');
let fixed = Date.parse(NOW);
if (Number.isNaN(fixed)) throw new Error(`clock.mjs: REGRESS_NOW を時刻として読めない: ${NOW}`);

const RealDate = Date;
function FrozenDate(...args) {
  if (!new.target) return new RealDate(fixed).toString();
  return args.length === 0 ? new RealDate(fixed) : new RealDate(...args);
}
FrozenDate.prototype = RealDate.prototype;
Object.setPrototypeOf(FrozenDate, RealDate);
FrozenDate.now = () => fixed;
FrozenDate.parse = RealDate.parse;
FrozenDate.UTC = RealDate.UTC;
globalThis.Date = FrozenDate;
// 走らせる側が、先読みが効いていることを確かめるための印
globalThis.__REGRESS_CLOCK__ = NOW;
/** 論理の時計を進める(suite/lib.mjs だけが使う) */
globalThis.__REGRESS_CLOCK_SET__ = (ms) => {
  fixed = ms;
};
