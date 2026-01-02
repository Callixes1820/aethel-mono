import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentBookings({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent bookings.</div>;
    }

    return (
        <div className="space-y-8">
            {data.map((booking) => (
                <div className="flex items-center" key={booking.res_id}>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {booking.first_name[0]}{booking.last_name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {booking.first_name} {booking.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {booking.res_status.replace('_', ' ')}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        +₱{Number(booking.total_amount).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    )
}
