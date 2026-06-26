import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Components work</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Badge>Badge</Badge>
        </CardContent>
      </Card>
    </div>
  );
}