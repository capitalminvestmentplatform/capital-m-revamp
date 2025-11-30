import { Suspense } from "react";
import VerifyResetPinPage from "./VerifyResetPinPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyResetPinPage />
    </Suspense>
  );
}
