import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, Bed } from "lucide-react"; // Added ChevronDown
import { RoomDetailsDialog } from "@/components/dashboard/RoomDetailsDialog"; // Added Import
import { SafeRoom, RoomStatus } from "@/types/room";

interface RoomCardProps {
    room: SafeRoom;
    onUpdateStatus: (roomId: number, status: RoomStatus) => void;
}

const statusColors: Record<RoomStatus, "default" | "secondary" | "destructive" | "outline"> = {
    Available: "default",
    Occupied: "secondary",
    Dirty: "outline",
    Maintenance: "destructive",
};

export function RoomCard({ room, onUpdateStatus }: RoomCardProps) {
    console.log("RoomCard Data:", room); // Debugging
    const getStatusColor = (status: RoomStatus) => {
        switch (status) {
            case "Available": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Occupied": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Dirty": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Maintenance": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <Card className="bg-[#1E293B] border-[#334155] text-white flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-mono tracking-wider">
                    {room.room_number}
                </CardTitle>
                <Badge variant="outline" className={getStatusColor(room.status as RoomStatus)}>
                    {room.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-400 flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    {room.type?.type_name || "Unknown Type"}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-0">
                <RoomDetailsDialog room={room} />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 cursor-pointer">
                            Actions
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-[#1E293B] border-[#334155] text-white">
                        <DropdownMenuLabel>Room Status</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#334155]" />
                        <DropdownMenuItem className="hover:bg-[#334155] cursor-pointer" onClick={() => onUpdateStatus(room.room_id, 'Available')}>
                            Mark Available
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#334155] cursor-pointer" onClick={() => onUpdateStatus(room.room_id, 'Occupied')}>
                            Mark Occupied
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#334155] cursor-pointer" onClick={() => onUpdateStatus(room.room_id, 'Dirty')}>
                            Mark Dirty
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#334155] cursor-pointer" onClick={() => onUpdateStatus(room.room_id, 'Maintenance')}>
                            Mark on Maintenance
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
