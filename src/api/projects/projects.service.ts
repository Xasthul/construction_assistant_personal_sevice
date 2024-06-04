import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../domain/models/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/domain/models/user.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll (userId: string): Promise<Project[]> {
        return await this.projectRepository.find({
            where: { users: [{ id: userId }] },
            relations: { users: false, steps: false, createdBy: false },
        });
    }

    async findById (projectId: string, userId: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: {
                id: projectId,
                users: [{ id: userId }]
            },
            relations: { users: false, steps: false, createdBy: false },
        });
        if (!project) {
            throw new NotFoundException();
        }
        return project;
    }

    async create (createProjectDto: CreateProjectDto, userId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { projects: false, createdProjects: false },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const project = new Project();
        project.title = createProjectDto.title;
        project.users = [user];
        project.createdById = user.id;
        await this.projectRepository.save(project);
    }

    async update (
        projectId: string,
        updateProjectDto: UpdateProjectDto,
        userId: string,
    ): Promise<void> {
        const project = await this.projectRepository.findOne({
            where: {
                id: projectId,
                users: [{ id: userId }]
            },
            relations: { users: false, steps: false, createdBy: false },
        });
        if (!project) {
            throw new NotFoundException();
        }
        await this.projectRepository.update(projectId, updateProjectDto);
    }

    async delete (projectId: string, userId: string): Promise<void> {
        const result = await this.projectRepository.delete({
            id: projectId,
            users: [{ id: userId }],
        });
        if (result.affected < 1) {
            throw new NotFoundException();
        }
    }
}
