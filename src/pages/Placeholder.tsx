import { Card, CardContent } from "../components/ui/card";

export function Placeholder({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card>
        <CardContent className="py-16 text-center text-gray-500">
          <p className="text-lg">{title} — শীঘ্রই আসছে</p>
          {desc && <p className="text-sm mt-2">{desc}</p>}
          <p className="text-xs mt-4">Documentation অনুযায়ী এই পেজটি build হবে।</p>
        </CardContent>
      </Card>
    </div>
  );
}
