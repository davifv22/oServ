/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_COMPANY_ID = 'c8d5f276-1565-467a-b9a7-b0db6235ce68'
const STATUS_POOL = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'FINISHED', 'CANCELED']
const PRIORITY_POOL = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const FIRST_NAMES = [
  'Carlos', 'Ana', 'Marcos', 'Luciana', 'Joao', 'Mariana', 'Paulo', 'Renata', 'Felipe', 'Camila',
  'Bruno', 'Juliana', 'Roberto', 'Patricia', 'Leandro', 'Vanessa', 'Rafael', 'Carla', 'Diego', 'Fernanda',
  'Ricardo', 'Beatriz', 'Rodrigo', 'Amanda', 'Anderson', 'Aline', 'Tiago', 'Bianca', 'Gustavo', 'Larissa'
]

const LAST_NAMES = [
  'Silva', 'Souza', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nunes', 'Lima', 'Gomes',
  'Martins', 'Rocha', 'Melo', 'Barbosa', 'Ribeiro', 'Fernandes', 'Cardoso', 'Moreira', 'Mendes', 'Araujo'
]

const CAR_MODELS = [
  'Onix', 'HB20', 'Corolla', 'Civic', 'Gol', 'Argo', 'T-Cross', 'Compass', 'Ranger', 'S10',
  'Kwid', 'Pulse', 'Tracker', 'Renegade', 'Toro'
]

const SERVICE_TEMPLATES = [
  { name: 'Troca de Oleo e Filtro', min: 120, max: 380 },
  { name: 'Alinhamento e Balanceamento', min: 90, max: 260 },
  { name: 'Revisao de Freios', min: 180, max: 780 },
  { name: 'Troca de Pastilhas', min: 140, max: 620 },
  { name: 'Troca de Disco de Freio', min: 280, max: 1400 },
  { name: 'Diagnostico Eletronico', min: 120, max: 450 },
  { name: 'Reparo de Suspensao', min: 260, max: 2400 },
  { name: 'Troca de Amortecedores', min: 420, max: 3200 },
  { name: 'Troca de Correia Dentada', min: 450, max: 2600 },
  { name: 'Reparo de Arrefecimento', min: 220, max: 1800 },
  { name: 'Limpeza de Bicos Injetores', min: 180, max: 520 },
  { name: 'Carga de Ar-Condicionado', min: 140, max: 480 },
  { name: 'Higienizacao do Ar', min: 110, max: 340 },
  { name: 'Troca de Embreagem', min: 880, max: 4200 },
  { name: 'Reparo de Cambio', min: 1200, max: 6800 },
  { name: 'Troca de Bateria', min: 260, max: 920 },
  { name: 'Troca de Velas e Cabos', min: 160, max: 980 },
  { name: 'Troca de Pneu', min: 75, max: 290 },
  { name: 'Revisao Completa 10k', min: 450, max: 1800 },
  { name: 'Revisao Completa 20k', min: 700, max: 2600 }
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(items) {
  return items[randomInt(0, items.length - 1)]
}

function randomName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`
}

function normalizeEmail(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

function randomDigits(length) {
  let output = ''
  while (output.length < length) {
    output += String(randomInt(0, 9))
  }
  return output
}

function randomPhone() {
  const ddd = randomInt(11, 99)
  const first = randomInt(90000, 99999)
  const second = randomInt(1000, 9999)
  return `${ddd}${first}${second}`
}

function randomCpf() {
  return randomDigits(11)
}

function randomPrice(min, max) {
  const cents = randomInt(min * 100, max * 100)
  return Number((cents / 100).toFixed(2))
}

function buildServiceRecords(companyId, quantity) {
  const records = []

  for (let index = 0; index < quantity; index += 1) {
    const template = randomItem(SERVICE_TEMPLATES)
    const suffix = index < SERVICE_TEMPLATES.length ? '' : ` - Linha ${index + 1}`

    records.push({
      companyId,
      name: `${template.name}${suffix}`,
      price: randomPrice(template.min, template.max)
    })
  }

  return records
}

function buildCustomerRecords(companyId, quantity) {
  const records = []

  for (let index = 0; index < quantity; index += 1) {
    const name = randomName()
    const email = `${normalizeEmail(name)}.${Date.now()}${index}@cliente.com`

    records.push({
      companyId,
      name,
      document: randomCpf(),
      email,
      phone: randomPhone()
    })
  }

  return records
}

function buildEmployeeRecords(companyId, quantity) {
  const positions = ['Mecanico', 'Eletricista', 'Consultor Tecnico', 'Chefe de Oficina', 'Auxiliar']
  const records = []

  for (let index = 0; index < quantity; index += 1) {
    const name = randomName()
    const email = `${normalizeEmail(name)}.${Date.now()}${index}@equipe.com`

    records.push({
      companyId,
      name,
      email,
      phone: randomPhone(),
      position: randomItem(positions),
      hasAccess: false,
      userId: null
    })
  }

  return records
}

function buildServiceOrderRecords(companyId, quantity, customers, employees, services) {
  const records = []

  for (let index = 0; index < quantity; index += 1) {
    const service = randomItem(services)
    const customer = randomItem(customers)
    const employee = randomItem(employees)
    const model = randomItem(CAR_MODELS)
    const plate = `${String.fromCharCode(randomInt(65, 90))}${String.fromCharCode(randomInt(65, 90))}${String.fromCharCode(randomInt(65, 90))}${randomInt(1000, 9999)}`
    const status = randomItem(STATUS_POOL)
    const priority = randomItem(PRIORITY_POOL)
    const total = randomPrice(Math.max(80, Math.floor(service.price * 0.7)), Math.floor(service.price * 1.6))

    records.push({
      companyId,
      customerId: customer.id,
      responsibleEmployeeId: employee.id,
      title: `${service.name} - ${model}`,
      description: `Veiculo ${model} placa ${plate}. Cliente relatou necessidade de ${service.name.toLowerCase()}. Ordem gerada automaticamente em lote para testes de carga.`,
      status,
      priority,
      total
    })
  }

  return records
}

async function createManyInChunks(modelName, data, chunkSize = 200) {
  let created = 0

  for (let index = 0; index < data.length; index += chunkSize) {
    const chunk = data.slice(index, index + chunkSize)
    if (chunk.length === 0) continue

    const result = await prisma[modelName].createMany({
      data: chunk
    })

    created += result.count
  }

  return created
}

async function main() {
  const companyId = process.argv[2] || DEFAULT_COMPANY_ID

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, tradeName: true, subdomain: true }
  })

  if (!company) {
    throw new Error(`Empresa ${companyId} nao encontrada.`)
  }

  const before = await Promise.all([
    prisma.service.count({ where: { companyId } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId } }),
    prisma.serviceOrder.count({ where: { companyId } })
  ])

  const SERVICE_QTY = 45
  const CUSTOMER_QTY = 260
  const EMPLOYEE_QTY = 55
  const ORDER_QTY = 1000

  console.log(`Empresa alvo: ${company.tradeName || company.name} (${company.id})`)
  console.log('Gerando massa de dados...')

  const servicesData = buildServiceRecords(companyId, SERVICE_QTY)
  const customersData = buildCustomerRecords(companyId, CUSTOMER_QTY)
  const employeesData = buildEmployeeRecords(companyId, EMPLOYEE_QTY)

  const createdServices = await createManyInChunks('service', servicesData, 150)
  const createdCustomers = await createManyInChunks('customer', customersData, 150)
  const createdEmployees = await createManyInChunks('employee', employeesData, 150)

  const [customers, employees, services] = await Promise.all([
    prisma.customer.findMany({
      where: { companyId },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 10000
    }),
    prisma.employee.findMany({
      where: { companyId },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 10000
    }),
    prisma.service.findMany({
      where: { companyId },
      select: { id: true, name: true, price: true },
      orderBy: { createdAt: 'desc' },
      take: 10000
    })
  ])

  if (customers.length === 0 || employees.length === 0 || services.length === 0) {
    throw new Error('Nao foi possivel obter clientes/funcionarios/servicos para montar as OS.')
  }

  const ordersData = buildServiceOrderRecords(companyId, ORDER_QTY, customers, employees, services)
  const createdOrders = await createManyInChunks('serviceOrder', ordersData, 200)

  const after = await Promise.all([
    prisma.service.count({ where: { companyId } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId } }),
    prisma.serviceOrder.count({ where: { companyId } })
  ])

  const summary = {
    company: company.tradeName || company.name,
    companyId,
    insertedNow: {
      services: createdServices,
      customers: createdCustomers,
      employees: createdEmployees,
      orders: createdOrders
    },
    totalsBefore: {
      services: before[0],
      customers: before[1],
      employees: before[2],
      orders: before[3]
    },
    totalsAfter: {
      services: after[0],
      customers: after[1],
      employees: after[2],
      orders: after[3]
    }
  }

  console.log('Concluido com sucesso:')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .catch(error => {
    console.error('Falha ao gerar massa de dados:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
