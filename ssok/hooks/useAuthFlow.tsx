// import { useEffect, useState } from 'react';
// import { useAuthStore } from '@/modules/auth/store/authStore';

// export function useAuthFlow() {
//   const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
//   const isLoading = useAuthStore((state) => state.isLoading);
//   const navigateAfterAuthCheck = useAuthStore(
//     (state) => state.navigateAfterAuthCheck,
//   );
//   const [isAuthChecking, setIsAuthChecking] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         await navigateAfterAuthCheck();
//       } finally {
//         setIsAuthChecking(false);
//       }
//     };

//     checkAuth();
//   }, [isLoggedIn, navigateAfterAuthCheck]);

//   return { isAuthChecking };
// }
