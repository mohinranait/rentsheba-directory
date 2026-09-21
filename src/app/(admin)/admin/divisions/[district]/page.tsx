import { MapIcon } from "lucide-react";
import { getDistricts } from "@/lib/locations";
import LocationTable from "../components/LocationTable";

export const dynamic = "force-dynamic";

const Locations = async ({
  params,
}: {
  params: Promise<{ district: string }>;
}) => {
  const { district } = await params;

  const locations = await getDistricts(district);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapIcon className="size-5" />
            </span>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Locations
              </h1>

              <p className="text-sm text-muted-foreground">
                Organize listings into an infinite nested hierarchy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <LocationTable locations={locations} />
      </div>
    </div>
  );
};

export default Locations;
