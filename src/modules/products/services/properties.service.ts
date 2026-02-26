import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class PropertiesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.property.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async findGrouped() {
        const properties = await this.prisma.property.findMany({
            orderBy: { name: 'asc' }
        });

        const grouped = properties.reduce<Record<string, string[]>>((acc, curr) => {
            if (!acc[curr.name]) {
                acc[curr.name] = [];
            }
            if (!acc[curr.name].includes(curr.value)) {
                acc[curr.name].push(curr.value);
            }
            return acc;
        }, {});

        return Object.entries(grouped).map(([name, values]) => ({
            name,
            values: (values as string[]).sort()
        }));
    }
}
