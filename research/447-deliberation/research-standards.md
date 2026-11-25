# #447 外部の調査(規格): 自動化の下での手作業の維持の頻度・記録・超過時の扱い

- 日付: 2026-11-17。担当: 外部の調査(規格)。新しい SRC は登録しない(候補は 5 節)
- 既存の出典台帳の確認: 航空の手動操縦の規定(AC 120-123・EASA SIB・SAFO 17007)・原子力・医療の維持の規定は `research/sources/` に**無い**。SAFO 13002 は `research/phase4-standard/288/research-03-continuity.md`(19〜21 行・199〜203 行・403 行)に抜き書きがあるが、SRC には未登録。ISO 42001・9001・IEC 61508・12207 は SRC-0090・0643・0649・0763 等にあるが、いずれも本文の 7.2 の読みは無い(公開プレビューまたは目録の確認に留まる)。以下は web で補った
- 読んだ強さ: 一次(規制の本文を直接取得)=AC 120-123・10 CFR 55.53・55.59(抜粋)・14 CFR 61.51/61.57・12207:2008。二次(解説記事)=ISO 42001/9001 の 7.2 の「文書化した情報」。**規格の有償本文は読んでいない**

## 1. 結論(問い(1)の表)

| 規定 | 頻度を組織に定めさせるか | 数値を課すか | 実施の記録を求めるか | 超過時の扱い |
| --- | --- | --- | --- | --- |
| FAA AC 120-123(2022-11、勧告) | 定める。運航者の方針で「適切な機会」を訓練と通常運航の両方に置く | **課さない。「検証された科学的証拠に基づかない限り、手動操縦の割当(例: 月10時間)を避けよ」と明記** | 手動操縦の実施の記録は求めない(勧告に記録の項は無い)。訓練の記録は別の規則 | 長期の不在後に技能を取り戻す方針を定めよ。停止・表示の定めは無い |
| FAA SAFO 13002(2013、勧告) | 方針で機会を確保せよ。頻度の数値は無し(research-03 の抜き書き) | 課さない | 求めない | 規定無し |
| EASA SIB 2013-05(2013-04、勧告) | 運航者の自動化方針に含める | 課さない | 求めない。SMS と飛行データ監視で逸脱の件数・傾向を**監視せよ**と勧める(SAFO との違い) | 方針の調整(監視の結果で) |
| 14 CFR 121.433(c)・61.57(拘束力のある規則) | — | **課す**(12暦月以内の定期訓練と技能審査、PIC は6暦月の飛行訓練。個人の飛行は90日以内に離着陸3回) | 61.51 が飛行の記録を課す(日・総時間・場所・機種・種別) | 期限を過ぎると**乗務できない(止める)** |
| 10 CFR 55.53(e)(f)・55.59(原子力の運転員) | 規則が定める | **課す**(四半期に8時間シフト7回または12時間シフト5回の実務。非発電炉は四半期4時間) | 再訓練の参加の記録を事業者が保持(55.59(c)(5))。実務の実施は事業者の証明 | 満たさないと活動を再開できない。再開前に40時間の監督付き実務と事業者の証明(55.53(f))。**止める** |
| ISO/IEC 42001 7.2・ISO 9001 7.2 | 定めない。必要な力量を決め、不足に処置し、有効性を評価する | 課さない | **求める**(力量の証拠としての文書化した情報。書式は定めない) | 不足は処置(教育・配置換え・採用)と有効性の評価。表示の定めは無い |
| ISO 9001 7.1.6 | — | — | 文書化した情報は**求めない**(解説者が指摘。7.2 と合わせて残すのが実務) | — |
| IEC 61508-1 6.2.13〜6.2.15 | 力量の「更新・再評価」の手順を定めよ | 課さない | 力量の根拠の文書化(機能安全管理計画の一部。適合性評価で運用記録を証拠にする) | 規定上は未充足の指摘。表示の仕組みは無い |
| ISO/IEC/IEEE 12207(6.2.4 人的資源管理) | 「技能が開発・維持・強化される」ことを成果とする | 課さない | 職員の成績・研修・技能の記録の維持(2008 版 6.2.4.3.3.5) | 規定無し |
| 医療(内視鏡の資格付与・再資格付与: SAGES・ASGE) | 学会指針は件数を示すが「件数は能力の代理指標にならない」とする。再資格付与の周期は施設が定める | 初期資格の件数は示す(例: 大腸内視鏡 150〜275件)。**維持の頻度の数値は本調査で確認できず** | 症例の記録(型・役割)を求める | 本調査では未確認 |

## 2. 該当箇所の抜き書き(原文)

- AC 120-123 3.2.2(https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf): "The operator policies should ensure there are appropriate opportunities for pilots to exercise manual flying skills during both training and line operations ... The operator's policy should address how to regain proficiency of MFO skills after pilots have short and long absences"
- 同 3.2.2.2: 手動操縦の方針は次を避けよ。"Quotas for manual flying, unless based on validated scientific evidence (e.g., 'shall fly manually at least 10 hours/month')"
- 同 3.2: "policy should not be overly prescriptive on requiring the use of automated systems at all times but instead encourage a culture that promotes joint responsibility of operator and individual pilots"。同 1.1.1: 本書は法の効力を持たない
- EASA Automation Policy(2013-05-28。https://www.easa.europa.eu/sites/default/files/dfu/sms-docs-EASp-SYS5.6---Automation-Policy---28-May-2013.pdf): "Compared to the US SAFO, the EASA SIB introduces risk control measures by encouraging to use of SMS and FDM to monitor the potential impact on the number, magnitude and pattern of deviations ... and adjust policies"
- SAFO 13002(research-03 の抜き書き): "Operational policies should be developed or reviewed to ensure there are appropriate opportunities for pilots to exercise manual flying skills, such as in non-RVSM airspace and during low workload conditions."
- 14 CFR 121.433(c)(1)(https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-121/subpart-O/section-121.433): "No certificate holder may use any person ... unless, within the preceding 12 calendar months ... the person has satisfactorily completed recurrent ground and flight training ... and a flight check"
- 14 CFR 61.51(b)(1)(https://www.law.cornell.edu/cfr/text/14/61.51): 飛行ごとに記録する項目に "Date. Total flight time or lesson time." 等。61.57(a): 90日以内に離着陸3回、"sole manipulator of the flight controls"
- 10 CFR 55.53(e)(https://www.law.cornell.edu/cfr/text/10/55.53): "To maintain active status, the licensee shall actively perform the functions of an operator or senior operator on a minimum of seven 8-hour or five 12-hour shifts per calendar quarter." (f): 満たさない場合、再開前に事業者の代表者が資格の現行性を証明し、"a minimum of 40 hours of shift functions under the direction of an operator or senior operator" を完了させる
- 10 CFR 55.59(c)(5)(https://www.ecfr.gov/current/title-10/chapter-I/part-55): "The facility licensee shall maintain records documenting the participation of each licensed operator and senior operator in the requalification program."
- ISO/IEC 42001 7.2(二次: https://techjacksolutions.com/iso/42001/what-is-iso-42001-clause-7 、 https://auditworkshop.com/blog/iso-42001-clause-7-support-explained): 力量を決める・確認する・不足に処置し有効性を評価する・"retain documented information as evidence of competence"。書式の指定は無い
- ISO 9001 7.2(二次: https://www.fabrico.io/blog/iso-9001-clause-7-2-competence): "Clause 7.2 d) does not prescribe a format"。7.1.6(https://blog.auditortrainingonline.com/blog/explaining-iso-9001-clause-7.1.6-organizational-knowledge): "there is no requirement to maintain or retain documented information"
- IEC 61508-1 6.2.13(https://share.ansi.org/Shared%20Documents/News%20and%20Publications/Other%20Documents/IEC%2061508%20Commented%20Version.pdf): "Such procedures shall include requirements for the refreshing, updating and continued assessment of competence."
- ISO/IEC 12207:2008 6.2.4.2 c): "skills of personnel are developed, maintained or enhanced"。6.2.4.3.3.5: "Maintain adequate records of staff performance including information on skills, training completed, and performance evaluations."(https://wildart.github.io/MISG5020/standards/IEEE-12207-2008.pdf)。2026-04 の第2版は目次のみ確認
- SAGES(https://www.sages.org/publications/guidelines/guidelines-privileging-credentialing-physicians-gastrointestinal-endoscopy): "case volume alone is not a valid predictor of competence in flexible endoscopy" / "Trainees should be required to maintain a log of cases documenting the type of procedure and their role"

## 3. 問い(2): 記録の項目として何を求めているか

- 航空(61.51): 日・総時間・場所・機種・種別(昼夜・計器)・操縦者の役割(sole manipulator)。要の3項目(日・対象・実施者)は、個人の記録帳が実施者を内包し、機種と飛行の種別が対象に当たる。実施の「中身」(本当に手で操縦したか)は、自己申告の記録帳で受ける
- 原子力(55.53・55.59): 実施者ごとの参加の記録(試験の写し・評価・追加訓練)。日は期間(四半期)で数え、実務の実施は事業者の証明で閉じる
- ISO 42001・9001 7.2: 項目を定めない。実務の例は「誰が・いつ・何の力量・観察または評価の結果」(技能表・署名と日付のある観察票)
- ISO 12207(2008 6.2.4.3.3.5): 技能・研修・評価の記録。対象と実施者を含み、日は研修の記録に含まれる
- 医療(SAGES): 症例の記録(型・役割)
- 総合: 規制が実施の記録を求める領域は、**拘束力のある規則で数値を課す領域**(航空の規則・原子力)と、**力量の証拠として文書化を求める品質規格**の二群。勧告の領域(AC 120-123・SAFO・EASA SIB)は記録を求めていない

## 4. 本件の案は世の中の実務と比べてどうか(1段落)

案(案件側の常時の実施の記録=日・対象領域・実施者、層1 の頻度を過ぎたら保証の開示に表示する、止めない)は、実務のどれとも完全には一致しないが、2群の中間に位置し、方向は妥当である。(a) 頻度を組織に定めさせ、標準が数値を課さない点は、AC 120-123・SAFO・EASA SIB と一致する。AC 120-123 は検証された科学的証拠の無い数値の割当を明確に避けよと書き、3.4.3 の「頻度と技能の維持の関係を測った研究が無い」と同じ根拠である。数値を課す航空規則と原子力は、いずれも長年の事故・運転の実績と拘束力ある許認可の下にあり、本標準の位置とは違う。(b) 記録を求める点は、ISO 42001・9001 の 7.2(力量の証拠の文書化)・ISO 12207 の人的資源の記録・航空の記録帳と整合し、勧告の領域より一歩厳しい。勧告の3文書は手動操縦の実施そのものの記録を求めておらず、EASA は代わりに飛行データの監視で傾向を見る。ここに本件は先例を持たない新しい義務を足す(勧告水準を超える)ことになるので、根拠水準マーク(E1 の推論、実証なし)の対象である。(c) 期限切れを「表示して止めない」点は、停止を課す航空規則・原子力(止める)より弱く、品質規格(不足は処置と有効性の評価、止める定めは無い)と勧告(超過時の定めが無い)に近い。3.4.3 の力量の確認(周期を過ぎれば失効と表示、止めない)とも同型で、既存の決定と整合する。止めないことは、頻度の根拠が弱いという本標準の立場とも釣り合う(止める規定を持つ領域は数値の根拠と許認可の拘束力を併せ持つ)。(d) 弱点: 実施の中身(本当に AI を用いなかったか)は、航空の記録帳も原子力の事業者の証明も自己申告か組織の証明で閉じており、機械で閉じる先例は無い。EASA のように客観データ(監視)で補う方式は、AI を用いない作業には対応物が無い。したがって「日付の比較は機械、中身は manual」という切り分けは実務の水準と同じで、過大な保証をうたわない開示が要る。(e) 常時の記録か、引き上げの判定の時点だけの記録かの二択は、規格からは決まらない。ISO の 7.2 は継続的な維持を前提に常時の証拠を求め、航空の記録帳も常時である。一方、勧告は記録を課さない。採用者への負担と、実施を欠いたときの損失(判断の席の確認の実効)を比べる所有者の決定事項である。

## 5. 出典台帳への登録候補(登録はしない)

| 候補 | 所在 | 用途 |
| --- | --- | --- |
| FAA AC 120-123 Flightpath Management(2022-11-21) | https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf | 数値の割当を避ける根拠。頻度は運航者が定める |
| FAA SAFO 13002(2013-01-04) | https://www.faa.gov/sites/faa.gov/files/other_visit/aviation_industry/airline_operators/airline_safety/SAFO13002.pdf | 既に research-03 に抜き書きあり。SRC 化の候補 |
| EASA SIB 2013-05 と Automation Policy(2013-05-28) | https://www.easa.europa.eu/sites/default/files/dfu/sms-docs-EASp-SYS5.6---Automation-Policy---28-May-2013.pdf | 飛行データ監視による傾向の監視。記録を課さない方式 |
| 14 CFR 121.433・61.51・61.57 | https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-121/subpart-O/section-121.433 ほか | 数値と記録と停止を課す拘束力のある例 |
| 10 CFR 55.53・55.59 | https://www.law.cornell.edu/cfr/text/10/55.53 | 四半期の実務の最低量と再開の手順(止める例) |
| ISO/IEC/IEEE 12207:2008 6.2.4(と 2026 年版の目次) | https://wildart.github.io/MISG5020/standards/IEEE-12207-2008.pdf | 技能の維持を成果とし、記録を求める |
| SAGES 内視鏡の資格付与の指針 | https://www.sages.org/publications/guidelines/guidelines-privileging-credentialing-physicians-gastrointestinal-endoscopy | 件数は能力の代理にならない。症例の記録 |

## 6. 未確認・限界(調べきれていない点)

- ISO 42001・9001 の 7.2 の本文は有償で、二次の解説で読んだ。書式の無指定は複数の解説が一致している
- 医療の「維持」の頻度の規定(再資格付与の周期・最低症例数)は確認できていない。上の表の医療の行は初期資格の件数までである
- 原子力の 55.53(e) 以外に、航空の SAFO 17007(手動操縦の維持)は未読(IATA の白書が言及するのみ)
- AC 120-123 の訓練の記録(14 CFR 121.427 以下)は手動操縦の項目別の記録かを確かめていない
