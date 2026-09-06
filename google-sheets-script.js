/**
 * ==============================================================================
 * 💌 모바일 청첩장 — 구글 스프레드시트 연동 Apps Script
 * ==============================================================================
 * 
 * [사용 방법]
 * 1. 구글 드라이브(https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
 * 2. 상단 메뉴 [확장 프로그램] → [Apps Script] 를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 파일의 내용을 그대로 붙여넣습니다.
 * 4. 상단 [배포] → [새 배포] 클릭
 *    - 유형 선택: [웹 앱] (톱니바퀴 아이콘)
 *    - 설명: 청첩장 RSVP 연동
 *    - 다음 사용자 권한으로 실행: [나] (내 구글 계정)
 *    - 액세스 권한이 있는 사용자: [모든 사용자] (⚠️ 꼭 '모든 사용자'로 선택해야 연동됩니다)
 * 5. [배포] 버튼을 누르고 권한 승인을 완료한 뒤, 생성된 "웹 앱 URL"을 복사합니다.
 * 6. 청첩장 프로젝트의 .env.local (및 Vercel 환경변수)에 등록합니다:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * ==============================================================================
 */

const SHEET_NAME = "참석명단";
const HEADERS = ["접수일시", "구분", "성함", "연락처", "참석여부", "참석인원", "식사여부"];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#2c2824");
    headerRange.setFontColor("#f6f3ee");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 36);
  }
  return sheet;
}

/** 청첩장에서 참석 여부(RSVP) 제출 시 호출 (POST) */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 동시 제출 충돌 방지
    const sheet = getOrCreateSheet();
    
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const nowStr = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    const sideText = data.side === "bride" ? "신부측" : "신랑측";
    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();
    const attending = Boolean(data.attending);
    const attendingText = attending ? "참석" : "불참";
    const partySize = attending ? Number(data.partySize || 1) : 0;
    
    let mealText = "해당없음";
    if (attending) {
      if (data.meal === "yes") mealText = "식사 예정";
      else if (data.meal === "no") mealText = "식사 안함";
      else mealText = "미정";
    }

    const newRow = [nowStr, sideText, name, phone, attendingText, partySize, mealText];
    sheet.appendRow(newRow);

    // 마지막 행 서식 (가운데 정렬 및 줄 간격)
    const lastRow = sheet.getLastRow();
    const rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    rowRange.setHorizontalAlignment("center");
    sheet.setRowHeight(lastRow, 30);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: "성공적으로 저장되었습니다." })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** 통계 및 명단 조회 (GET) — 관리자 확인용 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ok: true,
          stats: { total: 0, attendingCount: 0, attendingHeads: 0, mealYes: 0, mealNo: 0, mealUndecided: 0, declined: 0, groom: 0, bride: 0 },
          rows: []
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const rows = [];
    let attendingCount = 0;
    let attendingHeads = 0;
    let mealYes = 0;
    let mealNo = 0;
    let mealUndecided = 0;
    let declined = 0;
    let groom = 0;
    let bride = 0;

    for (let i = 1; i < values.length; i++) {
      const r = values[i];
      const rowItem = {
        created_at: r[0],
        side: r[1],
        name: r[2],
        phone: r[3],
        attending: r[4] === "참석",
        party_size: Number(r[5] || 0),
        meal: r[6]
      };
      rows.push(rowItem);

      if (rowItem.attending) {
        attendingCount++;
        attendingHeads += rowItem.party_size;
        if (rowItem.side === "신랑측") groom += rowItem.party_size;
        else if (rowItem.side === "신부측") bride += rowItem.party_size;

        if (rowItem.meal === "식사 예정") mealYes += rowItem.party_size;
        else if (rowItem.meal === "식사 안함") mealNo += rowItem.party_size;
        else mealUndecided += rowItem.party_size;
      } else {
        declined++;
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
        stats: {
          total: rows.length,
          attendingCount,
          attendingHeads,
          mealYes,
          mealNo,
          mealUndecided,
          declined,
          groom,
          bride
        },
        rows: rows.reverse() // 최신순
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
