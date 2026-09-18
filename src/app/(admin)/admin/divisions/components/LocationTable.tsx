"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type LocationType = "DIVISION" | "DISTRICT" | "UPAZILA";
interface Location {
    id: string;
    nameEn: string;
    nameLocal: string;
    slug: string;
    type: LocationType;
    parentId: string | null;
    parent?: { nameEn: string; nameLocal: string } | null;
    postalCode: string | null;
    lat: number | null;
    lon: number | null;
}
interface LocationTableProps {
    locations: Location[];
}
const typeLabel: Record<LocationType, string> = {
    DIVISION: "Division",
    DISTRICT: "District",
    UPAZILA: "Upazila",
};
const LocationTable = ({ locations }: LocationTableProps) => {
    return (
        <div className="overflow-hidden rounded-xl border bg-background">
            {" "}
            <Table>
                {" "}
                <TableHeader>
                    {" "}
                    <TableRow>
                        {" "}
                        <TableHead>Location</TableHead>{" "}
                        <TableHead>Type</TableHead>{" "}
                        <TableHead>Parent</TableHead>{" "}
                        <TableHead>Slug</TableHead>{" "}
                        <TableHead>Postal Code</TableHead>{" "}
                        <TableHead>Coordinates</TableHead>{" "}
                    </TableRow>{" "}
                </TableHeader>{" "}
                <TableBody>
                    {" "}
                    {locations?.length > 0 ? (
                        locations?.map((location) => (
                            <TableRow key={location.id}>
                                {" "}
                                <TableCell>
                                    {" "}
                                    <div>
                                        {" "}
                                        <p className="font-medium">
                                            {location.nameEn}
                                        </p>{" "}
                                        <p className="text-sm text-muted-foreground">
                                            {" "}
                                            {location.nameLocal}{" "}
                                        </p>{" "}
                                    </div>{" "}
                                </TableCell>{" "}
                                <TableCell>
                                    {" "}
                                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                        {" "}
                                        {typeLabel[location.type]}{" "}
                                    </span>{" "}
                                </TableCell>{" "}
                                <TableCell>
                                    {" "}
                                    {location.parent ? (
                                        <div>
                                            {" "}
                                            <p className="text-sm font-medium">
                                                {" "}
                                                {location.parent.nameEn}{" "}
                                            </p>{" "}
                                            <p className="text-xs text-muted-foreground">
                                                {" "}
                                                {location.parent.nameLocal}{" "}
                                            </p>{" "}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}{" "}
                                </TableCell>{" "}
                                <TableCell className="max-w-48 truncate text-muted-foreground">
                                    {" "}
                                    {location.slug}{" "}
                                </TableCell>{" "}
                                <TableCell>
                                    {" "}
                                    {location.postalCode ?? "—"}{" "}
                                </TableCell>{" "}
                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                    {" "}
                                    {location.lat !== null &&
                                        location.lon !== null
                                        ? `${location.lat}, ${location.lon}`
                                        : "—"}{" "}
                                </TableCell>{" "}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            {" "}
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {" "}
                                No locations found.{" "}
                            </TableCell>{" "}
                        </TableRow>
                    )}{" "}
                </TableBody>{" "}
            </Table>{" "}
        </div>
    );
};
export default LocationTable;
