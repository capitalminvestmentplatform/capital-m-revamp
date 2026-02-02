import dynamic from "next/dynamic";

const DistributionNoticesClient = dynamic(
  () => import("./DistributionNoticesPage"),
  { ssr: false },
);

export default function Page() {
  return <DistributionNoticesClient />;
}
