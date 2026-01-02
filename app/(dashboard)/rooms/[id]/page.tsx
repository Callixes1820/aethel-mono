export default function RoomDetailsPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Room {params.id} Details</h1>
            <p className="text-muted-foreground">Detailed view implementation coming soon.</p>
        </div>
    );
}
