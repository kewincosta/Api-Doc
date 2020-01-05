import { Response } from 'express'
import { knex } from '../db/connection'
import { NewRequest } from '../interface/NewRequest'
import resp from 'resp-express'

class Team {
  public async store (req: NewRequest, res: Response): Promise<any> {
    const { apiIdFk, teamName } = req.body
    try {
      const api = await knex('api').select().where({ id: apiIdFk })

      if (api.length !== 0) {
        if (api[0].isPublic === false) {
          if (api[0].userIdFk === req.userId) {
            const newTeam = await knex('teams').insert({
              teamName: teamName,
              apiIdFk: apiIdFk,
              managerIdFk: req.userId
            }).returning('*')
            resp.returnSucessObject(res, await newTeam)
          } else {
            resp.returnErrorMessage(res, 'A Api informada não é sua')
          }
        } else {
          resp.returnErrorMessage(res, 'A API não pode ser Pública')
        }
      } else {
        resp.returnErrorMessage(res, 'Api relacionada não existe')
      }
    } catch (error) {
      console.log(error)
      resp.returnErrorMessage(res, error)
    }
  }

  public async update (req: NewRequest, res: Response): Promise<any> {
    const { id } = req.params
    const { teamName } = req.body

    const team = await knex('teams').select().where({ id: id })

    try {
      if (team.length !== 0) {
        if (team[0].managerIdFk === req.userId) {
          const newTeam = await knex('teams').update({
            teamName: teamName
          }).returning('*')
          resp.returnSucessObject(res, newTeam)
        } else {
          resp.returnErrorMessage(res, 'Você não tem autorização para atualizar o time')
        }
      } else {
        resp.returnErrorMessage(res, 'O time informado não foi encontrado')
      }
    } catch (error) {
      resp.returnErrorMessage(res, error)
    }
  }

  public async index (req: NewRequest, res: Response): Promise<any> {
    try {
      const team = await knex('teams').select().where({ managerIdFk: req.userId })
      resp.returnSucessObject(res, team)
    } catch (error) {
      resp.returnErrorMessage(res, error)
    }
  }

  public async destroy (req: NewRequest, res: Response): Promise<any> {
    const { id } = req.params
    try {
      await knex('teams').where({ id: id }).del()
      resp.returnSucessMessage(res, 'O Time foi apagado com sucesso')
    } catch (error) {
      resp.returnErrorMessage(res, error)
    }
  }

  public async addMember (req: NewRequest, res: Response): Promise<any> {
    const { teamIdFk, email } = req.body
    try {
      const team = await knex('teams').select().where({
        id: teamIdFk,
        managerIdFk: req.userId
      })
      const user = await knex('users').select().where({ email: email })

      const rules = await knex('team_rules').select().where({
        teamIdFk: teamIdFk,
        userIdFk: user[0].id
      })

      if (team.length !== 0) {
        if (user.length !== 0) {
          if (rules.length === 1) {
            if (team[0].managerIdFk === req.userId) {
              const result = await knex('team_rules').insert({
                teamIdFk: teamIdFk,
                userIdFk: user[0].id
              }).returning('*')
              resp.returnSucessObject(res, result)
            } else {
              resp.returnErrorMessage(res, 'Você não tem autorização para adicionar membros')
            }
          } else {
            resp.returnErrorMessage(res, 'Esse usuário já está no time')
          }
        } else {
          resp.returnErrorMessage(res, 'O email informado não pertence a nenhum usuário')
        }
      } else {
        resp.returnErrorMessage(res, 'O time informado não existe')
      }
    } catch (error) {
      resp.returnErrorMessage(res, error)
    }
  }

  public async removeMember (req: NewRequest, res: Response): Promise<any> {
    const { id } = req.params
    try {
      await knex('team_rules').where({ id: id }).del()
      resp.returnSucessMessage(res, 'Membro removido com sucesso')
    } catch (error) {
      resp.returnErrorMessage(res, error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async listAllMembers (req: NewRequest, res: Response): Promise<any> {
    const { teamIdFk } = req.params

    try {
      const team = await knex('teams').select().where({ id: teamIdFk, managerIdFk: req.userId })
      if (team[0].length !== 0) {
        const result = await knex('team_rules').where({
          teamIdFk: teamIdFk
        }).join('users', 'users.id', 'team_rules.userIdFk').select('users.name', 'team_rules.id')
        resp.returnSucessObject(res, result)
      } else {
        resp.returnErrorMessage(res, 'Esse time não existe')
      }
    } catch (error) {
      console.log(error)
      resp.returnErrorMessage(res, error)
    }
  }
}

export default new Team()
