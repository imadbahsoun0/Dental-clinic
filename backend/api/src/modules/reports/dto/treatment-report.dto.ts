import { ApiProperty } from '@nestjs/swagger';

export class TreatmentStatusSummaryDto {
  @ApiProperty()
  planned!: number;

  @ApiProperty()
  inProgress!: number;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  cancelled!: number;
}

export class TreatmentValueSummaryDto {
  @ApiProperty({ description: 'Sum of totalPrice' })
  grossTotal!: number;

  @ApiProperty({ description: 'Sum of discount' })
  discountTotal!: number;

  @ApiProperty({ description: 'grossTotal - discountTotal' })
  netTotal!: number;
}

export class TreatmentTypeReportRowDto {
  @ApiProperty()
  treatmentTypeId!: string;

  @ApiProperty()
  treatmentTypeName!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty({ type: TreatmentValueSummaryDto })
  value!: TreatmentValueSummaryDto;
}

export class DoctorTreatmentReportRowDto {
  @ApiProperty()
  doctorId!: string;

  @ApiProperty()
  doctorName!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty({ type: TreatmentValueSummaryDto })
  value!: TreatmentValueSummaryDto;
}

export class TreatmentReportDto {
  @ApiProperty({ description: 'UTC start ISO used for the report' })
  startDate!: string;

  @ApiProperty({ description: 'UTC end ISO used for the report' })
  endDate!: string;

  @ApiProperty({ description: 'How value totals are computed' })
  valueRules!: string;

  @ApiProperty({ type: TreatmentStatusSummaryDto })
  statusSummary!: TreatmentStatusSummaryDto;

  @ApiProperty({ type: TreatmentValueSummaryDto })
  valueSummary!: TreatmentValueSummaryDto;

  @ApiProperty({ type: [TreatmentTypeReportRowDto] })
  byTreatmentType!: TreatmentTypeReportRowDto[];

  @ApiProperty({ type: [DoctorTreatmentReportRowDto] })
  byDoctor!: DoctorTreatmentReportRowDto[];
}
