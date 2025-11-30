import { Suspense } from "react";
import VerifyUserPage from "./VerifyUserPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUserPage />
    </Suspense>
  );
}
