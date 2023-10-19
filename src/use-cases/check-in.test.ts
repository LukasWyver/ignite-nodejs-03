import { CheckInUseCase } from './check-in'
import { expect, it, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-23.3045386),
      longitude: new Decimal(-51.1689972),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // deve ser possível fazer o check in...
  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -23.3045386,
      userLongitude: -51.1689972,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  // não deveria ser possível fazer check-in duas vezes no mesmo dia...
  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -23.3045386,
      userLongitude: -51.1689972,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -23.3045386,
        userLongitude: -51.1689972,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  // deve poder fazer check-in duas vezes em dias diferentes...
  it('should be able to check in twice in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -23.3045386,
      userLongitude: -51.1689972,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -23.3045386,
      userLongitude: -51.1689972,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  // não deve ser possível fazer check-in em uma academia distante...
  it('should not be able to check in on distant gym', async () => {
    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -23.3028871,
        userLongitude: -51.231772,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
