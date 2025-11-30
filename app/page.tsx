import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

const Home = () => {
  return (
    <div>
      <div className="relative isolate bg-white">
        {/* Header */}
        <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 lg:py-4 sm:px-6 lg:px-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Capital M Investments"
              width={480}
              height={120}
              priority
              className="h-10 w-auto sm:h-12 lg:h-40"
            />
          </Link>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-6 shadow-lg"
          >
            <Link
              href="/"
              className="
    inline-flex items-center justify-center gap-2
    h-11 px-[42px] rounded-xl
    font-bold text-sm text-white
    bg-cm-gold shadow-[0_2px_0_rgba(0,0,0,0.06),0_10px_20px_rgba(201,162,74,0.18)]
    no-underline cursor-pointer
    transition-transform
    animate-blink-bg
    hover:bg-cm-gold-700 hover:-translate-y-[1px]
    active:translate-y-0
  "
            >
              Investor Login
            </Link>
          </Button>
        </header>

        {/* Hero stage */}
        <section className="relative mx-auto w-full max-w-[1400px] px-4 pb-8 pt-2 sm:px-6 lg:px-10 lg:pb-16">
          {/* Left whitespace + accessible title to mirror the reference composition */}
          <h1 className="sr-only">Capital M Investments</h1>

          <div className="relative min-h-[320px] sm:min-h-[420px] md:min-h-[560px] lg:min-h-[580px] xl:min-h-[490px] 2xl:min-h-[570px] 3xl:min-h-[760px]">
            {/* Desktop / large screens: image pinned to the right */}
            <div className="pointer-events-none absolute xl:right-44 2xl:right-10 bottom-0 hidden select-none md:block">
              <Image
                src="/hero-image.png"
                alt="Rocket boosting over skyline"
                width={2000}
                height={1200}
                priority
                className="
        h-auto
        w-[80vw] min-w-[900px]
        lg:w-[75vw] lg:min-w-[1000px]
        xl:w-[56vw] xl:min-w-[910px]
        2xl:w-[50vw] 2xl:min-w-[1040px]
        3xl:w-[50vw] 3xl:min-w-[1250px]
      "
              />
            </div>
            {/* Mobile / small screens: centered image below header */}
            <div className="block select-none md:hidden">
              <Image
                src="/hero-image.png"
                alt="Rocket boosting over skyline"
                width={1200}
                height={800}
                priority
                className="mx-auto h-auto w-full max-w-[720px]"
              />
            </div>
          </div>
        </section>

        {/* Thin base rule like in the reference */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-slate-200" />
      </div>
      {/* <Image
        src={"/images/logo.png"}
        alt="home-logo"
        width={120}
        height={50}
        className="my-3 mx-10"
      />
      <div className="relative bg-homeBackground bg-cover bg-center h-screen px-16 py-10">
        <div className="absolute inset-0 bg-white bg-opacity-25 z-0" />

       <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
          <p className="font-bold text-4xl mb-4">Welcome to</p>
          <p className="font-bold text-4xl mb-4">Capital M Investments</p>
          <hr className="bg-black border-black w-52 mb-4" />
          <p className="font-semibold text-xl">
            The Family Investment Office of{" "}
          </p>
          <p className="font-semibold text-xl mb-5">Mostafa Bin Abdullatif</p>

          <Link
            href={"/auth/login"}
            className="bg-primaryBG py-2 px-5 rounded-md text-white text-md hover:bg-primaryBG"
          >
            Investor Login
          </Link>
        </div>
      </div> */}
      <div className="bg-primaryBG text-white py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <p className="text-3xl font-bold mb-2">
              A platform for accumulating and increasing the family’s wealth
            </p>
            <p className="mb-2">
              Capital M is the platform for our members to manage their wealth
              more efficiently and getting access to unique investment
              opportunities.
            </p>
            <p>
              Our goal is to protect, grow and preserve the wealth of our
              members.
            </p>
          </div>
        </div>
      </div>
      <div className="py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <p className="text-4xl text-primaryBG font-bold mb-2">
              In business for a century, here to last
            </p>
            <p className="mb-4">
              Mostafa Bin Abdullatif is a family owned business built on strong
              foundations of fair play, commitment and loyalty as laid down by
              our founder, Sheikh Mostafa Bin Abdullatif.
            </p>

            <p className="mb-6">
              We are operating numerous businesses in UAE and Bahrain for nearly
              a century and have built a diversified portfolio of commercial
              enterprises performing across a broad spectrum of the market.
            </p>
            <Link
              href={"/"}
              className="bg-primaryBG py-2 px-5 rounded-md text-white text-md hover:bg-primaryBG"
            >
              Read more
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-primaryBG text-white py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-wrap">
              <div className="w-1/2 lg:w-6/12">
                <h5 className="text-lg font-semibold">Address</h5>
                <p className="mb-5">
                  7th floor, O14 Tower, Al Abraj St, Business Bay Dubai, AE,
                </p>
                <div>
                  <a href="mailto:info@capitalm.ae" className="">
                    info@capitalm.ae
                  </a>
                </div>
              </div>

              <div className="w-1/2 lg:w-6/12">
                <h5 className="text-lg font-semibold">About us</h5>
                <p>Family Investment Office of Mostafa Bin Abdullatif</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
