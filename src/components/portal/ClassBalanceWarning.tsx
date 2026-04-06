"use client";

type Props = {
  classesLeft: number;
};

export default function ClassBalanceWarning({ classesLeft }: Props) {
  if (classesLeft > 1) return null;

  if (classesLeft === 1) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
        <p className="text-sm font-medium">
          You only have 1 class left in your current cycle.
        </p>
      </div>
    );
  }

  if (classesLeft === 0) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
        <p className="text-sm font-medium">
          Your class cycle has ended. Please purchase a new cycle to continue.
        </p>
      </div>
    );
  }
   if (classesLeft === -1) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="text-lg font-medium">
          You have exceeded your class limit. Please purchase a new cycle to continue. You will no longer have access to the portal until payment is updated. This is the last class available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-medium">
        Your class limit has been exceeded. Portal access is restricted until
        payment is updated.
      </p>
    </div>
  );
}
