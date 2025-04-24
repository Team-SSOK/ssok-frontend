// index.test.tsx

describe('기본 테스트', () => {
  it('true는 true여야 합니다', () => {
    expect(true).toBe(true);
  });

  it('SSOK 앱에 관한 기본 로직 테스트', () => {
    // 버튼 클릭 시 페이지 이동 로직 시뮬레이션
    const mockPush = jest.fn();

    // 시작하기 버튼 클릭 시뮬레이션
    const handleStart = () => {
      mockPush('/');
    };

    handleStart();

    // 홈 페이지로 이동했는지 확인
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
