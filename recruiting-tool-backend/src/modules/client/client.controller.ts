import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ClientService } from './client.service';
import { ClientFiltersDto, ClientResponseDto, CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginatedResponse } from 'src/dto/pagination.dto';

/**
 * Clients are an agency internal account list. There is no public endpoint here on
 * purpose: exposing who an agency works for would leak its book of business.
 */
@ApiTags('Client')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get('list')
  @ApiOperation({ summary: 'Get paginated clients list with search and status filtering' })
  @ApiResponse({ status: 200, description: 'Returns paginated clients list' })
  list(@Query() filters: ClientFiltersDto, @CurrentUser() currentUser: User): Promise<PaginatedResponse<ClientResponseDto>> {
    return this.clientService.list(filters, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get()
  @ApiOperation({ summary: 'Get every client of the current company (for pickers and filter dropdowns)' })
  @ApiResponse({ status: 200, description: 'Returns all clients of the current company', type: [ClientResponseDto] })
  findAll(@CurrentUser() currentUser: User): Promise<ClientResponseDto[]> {
    return this.clientService.findAll(currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Get(':uid')
  @ApiOperation({ summary: 'Get a single client by UID' })
  @ApiResponse({ status: 200, description: 'Returns the client details', type: ClientResponseDto })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<ClientResponseDto> {
    return this.clientService.findOne(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Post()
  @ApiOperation({ summary: 'Create a client - HR role required' })
  @ApiResponse({ status: 201, description: 'The client has been successfully created.', type: ClientResponseDto })
  @ApiResponse({ status: 409, description: 'A client with this slug already exists in your company' })
  @ApiBody({ type: CreateClientDto })
  create(@Body() createClientDto: CreateClientDto, @CurrentUser() currentUser: User): Promise<ClientResponseDto> {
    return this.clientService.create(createClientDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Put(':uid')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Returns the updated client', type: ClientResponseDto })
  @ApiBody({ type: UpdateClientDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateClientDto: UpdateClientDto, @CurrentUser() currentUser: User): Promise<ClientResponseDto> {
    return this.clientService.update(uid, updateClientDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
  })
  @Delete(':uid')
  @ApiOperation({ summary: 'Soft delete a client - HR role required' })
  @ApiResponse({ status: 200, description: 'The client has been successfully deleted.', type: MessageResponseDto })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MessageResponseDto> {
    return this.clientService.remove(uid, currentUser);
  }
}
