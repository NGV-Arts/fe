type Props = {
  title: string;
};

export default function PlaceholderSection({ title }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">Not yet implemented</p>
    </div>
  );
}
