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
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../core/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserProfileDto, ChangeUserRoleDto, UserResponseDto } from '../dto';
import {
  CreateUserUseCase,
  GetUserByIdUseCase,
  GetAllActiveUsersUseCase,
  UpdateUserProfileUseCase,
  ChangeUserRoleUseCase,
  ActivateUserUseCase,
  DeactivateUserUseCase,
  SoftDeleteUserUseCase,
  RestoreUserUseCase,
} from '../../application/use-cases';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllActiveUsersUseCase: GetAllActiveUsersUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly restoreUserUseCase: RestoreUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getAllActiveUsersUseCase.execute();
    return UserResponseDto.fromDomainList(users);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.getUserByIdUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserProfileUseCase.execute(id, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.changeUserRoleUseCase.execute(id, dto.role);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.activateUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.deactivateUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.softDeleteUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.restoreUserUseCase.execute(id);
    return UserResponseDto.fromDomain(user);
  }
}
