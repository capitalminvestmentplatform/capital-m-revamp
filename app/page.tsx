"use client";
import React from "react";
import Image from "next/image";

const Home = () => {
  return (
    <div>
      <main
        className="
          flex min-h-screen flex-col items-center text-white
          bg-[radial-gradient(circle_at_50%_78%,#16989f_2%,#059399_40%,#003133_100%)]
          font-sans
        "
      >
        {/* Navbar */}
        <header
          className="
            mt-5 w-full max-w-[1380px] mx-auto
            flex items-center justify-between
            px-4 sm:px-6 lg:px-8
            rounded-[50px]
            border border-white/70
            bg-white/15
            shadow-[0_4px_30px_rgba(0,0,0,0.1)]
            backdrop-blur-[7.7px]
          "
        >
          <div className="flex items-center">
            <Image
              src="/Capital M White logo.png"
              alt="Capital M Investments"
              width={160}
              height={30}
            />
          </div>
          <button
            onClick={() => {
              window.location.href = "/auth/login";
            }}
            className="
              rounded-full bg-[#f9b500] px-6 py-3 text-sm sm:text-base
              font-semibold text-black
              transition-colors duration-300
              hover:bg-[#ffc933]
            "
          >
            Investor Login
          </button>
        </header>

        {/* Hero Section */}
        <section
          className="
            mt-16 md:mt-20 text-center
            px-4
          "
        >
          <h1
            className="
              text-3xl sm:text-4xl md:text-5xl lg:text-6xl
              font-black leading-tight mb-5
            "
          >
            <b>
              Your Gateway to the <br />
              Family&apos;s{" "}
              <span className="text-[#f9b500] italic">
                <i>Future.</i>
              </span>
            </b>
          </h1>
          <p className="mb-8 text-sm sm:text-base text-[#cde4e6] leading-relaxed">
            Secure access to investments, portfolio insights and exclusive
            opportunities — <br className="hidden sm:inline" /> designed for the
            family and the generations to come.
          </p>
          <button
            onClick={() => {
              window.location.href = "/auth/login";
            }}
            className="
              rounded-full bg-[#f9b500] px-6 py-3
              font-semibold text-black
              transition-colors duration-300
              hover:bg-[#ffc933]
            "
          >
            Investor Login
          </button>
        </section>

        {/* Chart Background */}
        <div
          className="
            relative mt-10 flex items-center justify-center
            [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_100%)]
            [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_100%)]
          "
        >
          <Image
            src="/bars.png"
            alt="Chart Background"
            width={1440}
            height={300}
            className="h-auto max-w-full"
          />
        </div>

        {/* Features + Growth + Protection */}
        <div className="mt-4 w-full rounded-t-[80px] bg-white pt-12 pb-12">
          {/* Features */}
          <div
            className="
              mx-auto w-[90%]
              grid grid-cols-1 md:grid-cols-2
              items-center justify-center
              gap-10 lg:gap-24
              px-6 md:px-16
            "
          >
            {/* Left: 3 icons */}
            <div
              className="
                flex flex-wrap items-center justify-around
                gap-8 text-center
              "
            >
              <div className="flex flex-col items-center gap-2.5">
                <Image
                  src="/portfolio.png"
                  alt="Portfolio"
                  width={80}
                  height={80}
                />
                <h4 className="text-base font-semibold text-black">
                  Portfolio
                </h4>
              </div>
              <div className="flex flex-col items-center gap-2.5">
                <Image src="/growth.png" alt="Growth" width={80} height={80} />
                <h4 className="text-base font-semibold text-black">Growth</h4>
              </div>
              <div className="flex flex-col items-center gap-2.5">
                <Image
                  src="/opportunities.png"
                  alt="Opportunities"
                  width={80}
                  height={80}
                />
                <h4 className="text-base font-semibold text-black">
                  Opportunities
                </h4>
              </div>
            </div>

            {/* Right: wave graphic */}
            <div className="flex items-center justify-center">
              <Image
                src="/wave.png"
                alt="Investment Graph"
                width={500}
                height={150}
                className="h-auto max-w-full"
              />
            </div>
          </div>

          {/* Growth Section */}
          <section
            className="
              mx-auto mt-12 w-[84%]
              grid grid-cols-1 md:grid-cols-2
              gap-8
              px-6 md:px-16
            "
          >
            <div className="max-w-[600px] min-w-[320px]">
              <div className="mb-8 flex items-start gap-4">
                <Image
                  src="/plus-icon.png"
                  alt="Plus icon"
                  width={24}
                  height={24}
                  className="mt-[3px] flex-shrink-0"
                />
                <p className="m-0 text-base md:text-lg font-medium leading-relaxed text-[#1d2939]">
                  Diversified strategies for long-term stability and growth.
                </p>
              </div>

              <div className="mb-8 flex items-start gap-4">
                <Image
                  src="/plus-icon.png"
                  alt="Plus icon"
                  width={24}
                  height={24}
                  className="mt-[3px] flex-shrink-0"
                />
                <p className="m-0 text-base md:text-lg font-medium leading-relaxed text-[#1d2939]">
                  Opportunities across global/regional markets with family-first
                  access.
                </p>
              </div>

              <div className="mb-0 flex items-start gap-4">
                <Image
                  src="/plus-icon.png"
                  alt="Plus icon"
                  width={24}
                  height={24}
                  className="mt-[3px] flex-shrink-0"
                />
                <p className="m-0 text-base md:text-lg font-medium leading-relaxed text-[#1d2939]">
                  Clear, consolidated reporting to keep the family aligned.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:mt-0 mt-8">
              <Image
                src="/vector-arrow.png"
                alt="Growth Arrow"
                width={500}
                height={300}
                className="h-auto w-[480px] max-w-full object-contain"
              />
            </div>
          </section>

          {/* Protection Section */}
          <section
            className="
              relative mx-auto -mt-6
              w-[77%]
              rounded-2xl bg-[#386264]
              px-6 md:px-10
              pb-12 pt-6
              text-white
              overflow-hidden
              flex justify-center
            "
          >
            <div className="max-w-[900px] text-center text-white">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/MBAL.png"
                  alt="MBA Badge"
                  width={200}
                  height={120}
                />
              </div>

              <h2 className="mb-4 text-2xl font-bold text-white md:text-[2rem]">
                Protected. Private. Secure.
              </h2>

              <p className="mx-auto mb-10 max-w-[600px] text-sm md:text-base leading-relaxed text-white/90">
                Bank-level encryption, strict access control and confidential
                reporting — built exclusively for family members.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  className="
                    rounded-full border border-white
                    bg-white px-7 py-3
                    text-sm font-medium text-[#054e4f]
                    transition-colors duration-300
                    hover:bg-gray-100
                  "
                >
                  Bank-level encryption
                </button>
                <button
                  className="
                    rounded-full border border-white/80
                    bg-transparent px-7 py-3
                    text-sm font-medium text-white
                    transition-colors duration-300
                    hover:bg-white/10
                  "
                >
                  Family-only access
                </button>
                <button
                  className="
                    rounded-full border border-white/80
                    bg-transparent px-7 py-3
                    text-sm font-medium text-white
                    transition-colors duration-300
                    hover:bg-white/10
                  "
                >
                  Confidential reporting
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex w-full justify-center bg-white pt-[300px] pb-24">
          <footer
            className="
              relative w-[77%]
              rounded-2xl
              bg-[linear-gradient(180deg,#f9fbfb_0%,#edf3f3_100%)]
              pt-16 text-center
            "
          >
            {/* Top section with logos and info */}
            <div
              className="
                relative flex flex-col md:flex-row
                justify-between
                px-6 md:px-12 lg:px-24
                pt-16 pb-10
              "
            >
              {/* Center decorative logo */}
              <div
                className="
                  pointer-events-none absolute
                  -top-[395px] left-1/2
                  -translate-x-1/2
                "
              >
                <Image
                  src="/footer-bg.png"
                  alt="Capital M Decorative"
                  width={400}
                  height={400}
                  className="h-auto w-[350px] opacity-95"
                />
              </div>

              {/* Left side - Capital M */}
              <div className="z-10 mb-8 text-left md:mb-0">
                <div className="mb-5">
                  <Image
                    src="/logo_1.png"
                    alt="Capital M"
                    width={160}
                    height={80}
                    className="-ml-12"
                  />
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3">
                    <div className="">
                      <Image
                        src="/pin.png"
                        alt="Location"
                        width={20}
                        height={20}
                        className="mt-[2px]"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-[#0a3c3e]">
                        Location:
                      </p>
                      <p className="m-0 text-sm leading-relaxed text-[#0a3c3e]">
                        7th floor, O14 Tower,
                        <br />
                        Business Bay, Dubai, UAE
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="">
                      <Image
                        src="/mail.png"
                        alt="Email"
                        width={20}
                        height={20}
                        className="mt-[2px]"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-[#0a3c3e]">
                        Email:
                      </p>
                      <p className="m-0 text-sm leading-relaxed text-[#0a3c3e]">
                        info@capitalm.ae
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - MBA */}
              <div
                className="
                  z-10 flex flex-col items-start
                  text-left
                  md:items-start md:text-left
                "
              >
                <Image
                  src="/mbal-logo-black.png"
                  alt="MBA Logo"
                  width={170}
                  height={70}
                  className="h-auto w-[170px]"
                />
                <p className="mt-5 text-base leading-relaxed text-[#0a3c3e]">
                  The Family Investment Office of
                  <br />
                  Mostafa Bin Abdullatif
                </p>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="border-t border-[#dce5e4] py-6">
              <p className="m-0 text-xs text-[#0a3c3e] opacity-90">
                Copyright © 2025 Capital M. All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Home;
