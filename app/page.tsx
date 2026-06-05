import LiveOffice from "@/components/live-office/LiveOffice";

export default function HomePage() {
  return (
    /* Full-coverage pastel background that overrides the dark canvas */
    <div className="-m-8 p-8 min-h-[calc(100vh-0px)] bg-gradient-to-br from-[#FCF8FF] via-[#F8F0FF] to-[#FFF0F8]">
      <LiveOffice />
    </div>
  );
}
