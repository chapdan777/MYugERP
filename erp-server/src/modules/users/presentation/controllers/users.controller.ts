import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../core/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserProfileDto, ChangeUserRoleDto, UserResponseDto } from '../dto';
import {
  CreateUserUseCase,
  GetUserByIdUseCase,
  GetAllNotDeletedUsersUseCase,
  UpdateUserProfileUseCase,
  ChangeUserRoleUseCase,
  ActivateUserUseCase,
  DeactivateUserUseCase,
  SoftDeleteUserUseCase,
  RestoreUserUseCase,
} from '../../application/use-cases';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllNotDeletedUsersUseCase: GetAllNotDeletedUsersUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly restoreUserUseCase: RestoreUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Пользователь успешно создан', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех неудаленных пользователей' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список пользователей успешно получен', 
    type: [UserResponseDto] 
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getAllNotDeletedUsersUseCase.execute();
    return UserResponseDto.fromDomainList(users);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Пользователь найден', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.getUserByIdUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Профиль пользователя успешно обновлен', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserProfileUseCase.execute(id, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Изменить роль пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiBody({ type: ChangeUserRoleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Роль пользователя успешно изменена', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.changeUserRoleUseCase.execute(id, dto.role);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Активировать пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Пользователь успешно активирован', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.activateUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Деактивировать пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Пользователь успешно деактивирован', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.deactivateUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Мягкое удаление пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Пользователь успешно удален', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.softDeleteUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Восстановить пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Пользователь успешно восстановлен', 
    type: UserResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.restoreUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }
}
