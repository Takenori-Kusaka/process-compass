# 回帰スイートの複製(suite-A)の fixture を、決定 A-4(出荷判定者の席は独立レビュアの席と兼ねない)に合わせる。
# tmp/fix288-tpl2/ は変えない。直すのは tmp/302-310/implA/suite-A だけ。
# 固定していた決定は「任免の記名」(tx-4)と「3名の全検査」であり、独立レビュアと出荷判定者の兼務の可否ではない(調査 304 1.4)。
import io, os, sys

here = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(here, 'suite-A')

def patch(name, pairs):
    p = os.path.join(S, name)
    s = io.open(p, encoding='utf-8', newline='').read()
    for old, new, n in pairs:
        c = s.count(old)
        assert c == n, (name, old[:60], c, n)
        s = s.replace(old, new)
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('patched', name, len(pairs))

REV_C = "'independent-reviewer': { accountable: 'c' }, 'qa-gatekeeper': { accountable: 'c' }"
REV_A = "'independent-reviewer': { accountable: 'a' }, 'qa-gatekeeper': { accountable: 'c' }"

# new.mjs / tz.mjs: 3名の土台。独立レビュアを c(出荷判定者)から a(事業決裁者・価値責任者・技術判断者)へ移す
patch('new.mjs', [(REV_C, REV_A, 1)])
patch('tz.mjs', [(REV_C, REV_A, 1)])

# v3.mjs: 5名の土台 s4。独立レビュアを鈴木(c。出荷判定者)から山田(a)へ移す
patch('v3.mjs', [
    ("// s4: 山田=事業決裁・価値・文脈・AI運用、佐藤=技術・開発・AI維持管理、鈴木=独立レビュア・出荷判定",
     "// s4: 山田=事業決裁・価値・文脈・AI運用・独立レビュア、佐藤=技術・開発・AI維持管理、鈴木=出荷判定(決定 A-4: 出荷判定者は独立レビュアと兼ねない)", 1),
    ("  'independent-reviewer': { accountable: 'c' },\n  'qa-gatekeeper': { accountable: 'c' },",
     "  'independent-reviewer': { accountable: 'a' },\n  'qa-gatekeeper': { accountable: 'c' },", 1),
    # tx-4: 2つの席を、別々の人へ交代させる(任免の記名の検査は残す)
    ("refused('tx-4 独立レビュアと出荷判定者を田中へ(記名なし)', change({ kind: 'accountable', date: DAY, summary: '交代', seats: { 'independent-reviewer': { accountable: '田中 三郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } } }), '任免');",
     "refused('tx-4 独立レビュアを高橋へ、出荷判定者を田中へ(記名なし)', change({ kind: 'accountable', date: DAY, summary: '交代', seats: { 'independent-reviewer': { accountable: '高橋 次郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } } }), '任免');", 1),
    ("seats: { 'independent-reviewer': { accountable: '田中 三郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } }, decidedBy: '山田 太郎', reason: '鈴木を別案件へ' });",
     "seats: { 'independent-reviewer': { accountable: '高橋 次郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } }, decidedBy: '山田 太郎', reason: '鈴木を別案件へ' });", 1),
    # 独立レビュアの席の委任: 席の責任者は山田
    ("qualification: { ...QUAL, performer: PREV, approvedBy: '鈴木 一郎' } } },\n    delegation: { rules: [RULE, { ...RULE, id: 'DR-002', seat: 'independent-reviewer', decidedBy: '鈴木 一郎', reason: '文言は事後に抜き取る' }] },\n    decidedBy: '鈴木 一郎',",
     "qualification: { ...QUAL, performer: PREV, approvedBy: '山田 太郎' } } },\n    delegation: { rules: [RULE, { ...RULE, id: 'DR-002', seat: 'independent-reviewer', decidedBy: '山田 太郎', reason: '文言は事後に抜き取る' }] },\n    decidedBy: '山田 太郎',", 1),
])

# v3.mjs: 山田(独立レビュアも持つ)が離脱する場面。空く席に独立レビュアを足し、後任の任命にも足す
patch('v3.mjs', [
    ("'context-owner': { accountable: null }, 'ai-ops': { accountable: null } }",
     "'context-owner': { accountable: null }, 'ai-ops': { accountable: null }, 'independent-reviewer': { accountable: null } }", 1),
    ("'context-owner': { accountable: '田中 三郎' }, 'ai-ops': { accountable: '田中 三郎' } }",
     "'context-owner': { accountable: '田中 三郎' }, 'ai-ops': { accountable: '田中 三郎' }, 'independent-reviewer': { accountable: '田中 三郎' } }", 1),
])
