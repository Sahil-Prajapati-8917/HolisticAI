
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Activity {
    id: string;
    candidateName: string;
    role: string;
    status: string;
    timestamp: string;
    score: number;
}

interface RecentActivityTableProps {
    data: Activity[];
}

export function RecentActivityTable({ data }: RecentActivityTableProps) {
    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Candidate</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{item.candidateName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {item.candidateName}
                                </div>
                            </TableCell>
                            <TableCell>{item.role}</TableCell>
                            <TableCell>
                                <Badge variant={item.status === 'Hired' ? 'default' : 'secondary'}>
                                    {item.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{item.score}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
