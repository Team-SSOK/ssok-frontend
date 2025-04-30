import { Buffer } from 'buffer';

/**
 * iBeacon 제조사 데이터 파싱 함수
 *
 * @param manufacturerData - 디바이스에서 받은 제조사 데이터 base64 문자열
 * @returns parsedData - 파싱된 iBeacon 데이터 객체 (프로토콜 규격에 맞지 않으면 null 반환)
 */
export const parseIBeaconData = (
  manufacturerData: string | null,
): {
  uuid: string;
  major: number;
  minor: number;
  txPower: number;
} | null => {
  if (!manufacturerData) return null;

  try {
    // base64 데이터를 디코딩
    const data = Buffer.from(manufacturerData, 'base64');

    // iBeacon 프로토콜 확인
    // 첫 2바이트는 회사 ID (리틀 엔디언), 그 다음 바이트부터 iBeacon 데이터
    // iBeacon 프로토콜은 0x02, 0x15로 시작해야 함 (Apple의 iBeacon 프리픽스)
    if (data.length < 25 || data[2] !== 0x02 || data[3] !== 0x15) {
      return null;
    }

    // UUID는 4-6-8-4 포맷으로 16바이트
    const uuid = [
      data.slice(4, 8).toString('hex'),
      data.slice(8, 10).toString('hex'),
      data.slice(10, 12).toString('hex'),
      data.slice(12, 14).toString('hex'),
      data.slice(14, 20).toString('hex'),
    ].join('-');

    // Major는 2바이트 (빅 엔디언)
    const major = data.readUInt16BE(20);

    // Minor는 2바이트 (빅 엔디언)
    const minor = data.readUInt16BE(22);

    // 송신 파워는 1바이트 (2의 보수 부호 있는 정수)
    const txPower = data[24];

    return { uuid, major, minor, txPower };
  } catch (error) {
    console.error('[BLE] Error parsing iBeacon data:', error);
    return null;
  }
};

/**
 * iBeacon 제조사 데이터 생성 함수 (테스트용)
 *
 * @param uuid - UUID 문자열 (포맷: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * @param major - Major 값 (0-65535)
 * @param minor - Minor 값 (0-65535)
 * @param txPower - 송신 파워 (-128 ~ 127)
 * @returns 16진수 문자열로 변환된 제조사 데이터
 */
export const createIBeaconData = (
  uuid: string,
  major: number,
  minor: number,
  txPower: number = -59,
): string => {
  // UUID 문자열에서 하이픈 제거
  const cleanUuid = uuid.replace(/-/g, '');

  // 결과 버퍼 생성 (2바이트 회사 ID + 2바이트 iBeacon 프리픽스 + 16바이트 UUID + 2바이트 Major + 2바이트 Minor + 1바이트 txPower)
  const buffer = Buffer.alloc(25);

  // 회사 ID 설정 (0x00E0, 리틀 엔디언)
  buffer.writeUInt16LE(0x00e0, 0);

  // iBeacon 프리픽스 설정 (0x02, 0x15)
  buffer[2] = 0x02;
  buffer[3] = 0x15;

  // UUID 설정 (16바이트)
  Buffer.from(cleanUuid, 'hex').copy(buffer, 4);

  // Major 설정 (2바이트, 빅 엔디언)
  buffer.writeUInt16BE(major, 20);

  // Minor 설정 (2바이트, 빅 엔디언)
  buffer.writeUInt16BE(minor, 22);

  // 송신 파워 설정 (1바이트)
  buffer[24] = txPower;

  return buffer.toString('hex');
};
/**
 * 고유 식별자 생성 함수
 *
 * @returns 랜덤으로 생성된 UUID 문자열
 */
export const generateUUID = (): string => {
  // 랜덤 UUID 생성 (RFC4122 버전 4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * UUID 간소화 함수 (디스플레이용)
 *
 * @param uuid - 전체 UUID 문자열
 * @returns 첫 8자와 마지막 8자로 간소화된 UUID 문자열
 */
export const shortenUUID = (uuid: string): string => {
  if (!uuid || uuid.length < 36) return uuid;
  return `${uuid.substring(0, 8)}...${uuid.substring(28)}`;
};
