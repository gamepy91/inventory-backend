import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateActivityDto } from './dto/create-activity.dto';

@UseGuards(JwtAuthGuard)
@Controller('items/:itemId/activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  list(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query() q: PaginationDto,
  ) {
    return this.service.listByItem(itemId, q);
  }

  @Post()
  add(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateActivityDto,
  ) {
    return this.service.addActivity(itemId, dto);
  }

  @Get('series')
  series(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Query('days') days?: string,
  ) {
    const n = Math.max(1, Math.min(7, Number(days) || 7));
    return this.service.getSeries(itemId, n);
  }
}
