import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from '../../common/entities/expense.entity';
import { UserOrganization } from '../../common/entities/user-organization.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Expense, UserOrganization])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
