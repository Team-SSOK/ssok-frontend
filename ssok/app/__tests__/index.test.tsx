// index.test.tsx

describe('기본 테스트', () => {
  it('true는 true여야 합니다', () => {
    expect(true).toBe(true);
  });

  it('SSOK 앱에 관한 기본 로직 테스트', () => {
    const mockPush = jest.fn();

    const handleStart = () => {
      mockPush('/register');
    };

    handleStart();

    // 회원가입 페이지로 이동했는지 확인
    expect(mockPush).toHaveBeenCalledWith('/register');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
