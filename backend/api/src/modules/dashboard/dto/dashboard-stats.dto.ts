import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: "Count of today's appointments (not cancelled or deleted)",
  })
  todayAppointments!: number;

  @ApiProperty({ description: 'Total number of active patients' })
  totalPatients!: number;

  @ApiProperty({
    description: 'Sum of all patient balances (treatment costs - payments)',
  })
  pendingPayments!: number;

  @ApiProperty({ description: "Today's total payments minus today's expenses" })
  dailyNetIncome!: number;
}
