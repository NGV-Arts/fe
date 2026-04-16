"use client";

import Image from "next/image";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AuthBrandHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-red-200/35 via-orange-200/20 to-amber-200/35 blur-xl" />
        <div className="absolute inset-0 rounded-full ring-1 ring-red-200/70 ring-offset-4 ring-offset-white" />

        <div className="relative animate-[fadeInUp_500ms_ease-out]">
          <Image
            src="/logo.png"
            alt="NGV Arts"
            width={112}
            height={112}
            priority
            className="h-24 w-24 rounded-full border border-red-100 bg-white object-contain shadow-lg sm:h-28 sm:w-28"
          />
        </div>
      </div>

      <h1 className="text-center text-2xl font-semibold text-gray-900">
        {title}
      </h1>

      {subtitle ? (
        <p className="mt-2 max-w-md text-center text-sm text-gray-600">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
