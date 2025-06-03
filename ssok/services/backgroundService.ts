const LOG_TAG = '[LOG][backgroundService]';

/**
 * 백그라운드 상태 관리 서비스
 *
 * 앱의 백그라운드/포그라운드 전환 시 보안 관련 상태를 관리합니다.
 * 최소한의 기능만 제공하여 시스템 리소스를 절약합니다.
 */
export class BackgroundService {
  private static instance: BackgroundService;
  private isInBackground = false;
  private backgroundStartTime: number | null = null;

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  /**
   * 앱이 백그라운드로 전환될 때 호출
   */
  public onAppBackground(): void {
    console.log(`${LOG_TAG} App entered background`);
    this.isInBackground = true;
    this.backgroundStartTime = Date.now();

    // 백그라운드 진입 시 최소한의 작업 수행
    this.performBackgroundEntry();
  }

  /**
   * 앱이 포그라운드로 복귀할 때 호출
   */
  public onAppForeground(): void {
    console.log(`${LOG_TAG} App returned to foreground`);

    const backgroundDuration = this.getBackgroundDuration();
    console.log(`${LOG_TAG} Background duration: ${backgroundDuration}ms`);

    this.isInBackground = false;
    this.backgroundStartTime = null;

    // 포그라운드 복귀 시 최소한의 작업 수행
    this.performForegroundReturn(backgroundDuration);
  }

  /**
   * 백그라운드 진입 시 수행할 작업
   */
  private performBackgroundEntry(): void {
    try {
      const timestamp = new Date().toISOString();
      console.log(`${LOG_TAG} Background entry logged at: ${timestamp}`);

      // 필요시 추가 보안 관련 작업 수행
      // 예: 민감한 데이터 임시 숨김, 보안 플래그 설정 등
    } catch (error) {
      console.error(`${LOG_TAG} Error in background entry:`, error);
    }
  }

  /**
   * 포그라운드 복귀 시 수행할 작업
   */
  private performForegroundReturn(backgroundDuration: number): void {
    try {
      const timestamp = new Date().toISOString();
      console.log(`${LOG_TAG} Foreground return logged at: ${timestamp}`);

      // 백그라운드 시간이 일정 시간 이상이면 추가 보안 검증 필요
      const SECURITY_THRESHOLD = 30000; // 30초
      if (backgroundDuration > SECURITY_THRESHOLD) {
        console.log(
          `${LOG_TAG} Long background duration detected, security check required`,
        );
      }
    } catch (error) {
      console.error(`${LOG_TAG} Error in foreground return:`, error);
    }
  }

  /**
   * 백그라운드 지속 시간 계산
   */
  private getBackgroundDuration(): number {
    if (!this.backgroundStartTime) {
      return 0;
    }
    return Date.now() - this.backgroundStartTime;
  }

  /**
   * 현재 백그라운드 상태 확인
   */
  public isAppInBackground(): boolean {
    return this.isInBackground;
  }

  /**
   * 백그라운드 시작 시간 반환
   */
  public getBackgroundStartTime(): number | null {
    return this.backgroundStartTime;
  }

  /**
   * 서비스 상태 리셋
   */
  public reset(): void {
    console.log(`${LOG_TAG} Service reset`);
    this.isInBackground = false;
    this.backgroundStartTime = null;
  }
}

// 싱글톤 인스턴스 내보내기
export const backgroundService = BackgroundService.getInstance();
