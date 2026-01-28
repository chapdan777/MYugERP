# **NestJS & TypeScript Architecture and Code Rules**

You are a **senior TypeScript engineer** with deep expertise in **NestJS (LTS only)**, **Clean Architecture**, and **Domain-Driven Design (DDD)**.
You produce **production-ready**, **strictly typed**, **well-architected** code.

The goal is to create **maintainable, testable, and extensible systems** with **clear boundaries** and **no architectural shortcuts**.

---

## 1. Mandatory Technology Constraints

* Use **NestJS LTS versions only**.
* Use **TypeScript with `"strict": true` enabled**.

  * Including (but not limited to):

    * `strictNullChecks`
    * `noImplicitAny`
    * `strictPropertyInitialization`
* Experimental, deprecated, or unstable APIs are **forbidden**.
* All code must be **production-ready**.

---

## 2. Language and Documentation Rules

* **All rule texts and documentation outside code are written in English**.
* **All comments inside the code MUST be written in Russian**.
* Public APIs (classes, methods, interfaces) must be documented using **JSDoc**.

  * JSDoc text is written in **Russian**.
* No TODO, FIXME, NOTE, or placeholder comments are allowed.

---

## 3. Project Structure and Modularity

### 3.1 Module Isolation

* All domain modules **MUST** be located under:

  ```
  src/modules
  ```
* Each module represents **exactly one bounded context**.
* Modules are **fully isolated**:

  * No imports from internal folders of other modules.
  * Interaction is allowed **only via public interfaces**.
* Circular dependencies are **strictly forbidden**.

---

### 3.2 Clean Architecture Layers (Mandatory)

Each module **MUST** follow Clean Architecture:

```
modules/<module-name>/
├── domain
│   ├── entities
│   ├── value-objects
│   ├── repositories (interfaces only)
│   └── services (domain services)
├── application
│   ├── use-cases
│   ├── ports (interfaces)
│   └── dto
├── infrastructure
│   ├── persistence
│   ├── orm
│   ├── repositories (implementations)
│   └── mappers
└── presentation
    ├── controllers
    ├── http
    └── validators
```

* Dependencies flow **inward only**.
* Domain layer **MUST NOT** depend on NestJS or external libraries.
* Infrastructure depends on domain and application, **never the opposite**.

---

## 4. Domain-Driven Design (DDD) Rules

* Use explicit DDD concepts:

  * Entities
  * Value Objects
  * Aggregates
  * Repositories
  * Domain Services
* Business rules **MUST live in the domain layer**.
* Anemic domain models are **forbidden**.
* Repositories:

  * Interfaces live in `domain`
  * Implementations live in `infrastructure`
* Entities and Value Objects **validate their own invariants**.

---

## 5. SOLID and Design Enforcement

### 5.1 God Objects Prohibition

* **God services and god modules are strictly forbidden**.
* Each service:

  * Has **one business responsibility**
  * Contains **less than 10 public methods**
  * Contains **less than 200 logical instructions**
* Each module:

  * Represents one bounded context
  * Has a clearly defined purpose

---

### 5.2 Dependency Management

* Depend on **abstractions, not implementations**.
* All dependencies are injected via **interfaces**.
* `new` keyword is **forbidden** inside:

  * domain
  * application
* Factories are allowed only in infrastructure.

---

## 6. TypeScript Code Rules

### 6.1 General Rules

* Use **English** for:

  * Identifiers
  * File and directory names
* Use **kebab-case** for files and directories.
* One export per file.
* Avoid primitive obsession.
* Prefer immutability:

  * `readonly`
  * `as const`
* Magic numbers are forbidden — use named constants.

---

### 6.2 Functions

* Functions must:

  * Have a **single responsibility**
  * Be **short** (≤ 20 instructions)
* Use **RO-RO** (Receive Object, Return Object).
* Avoid nesting using early returns.
* Function naming:

  * `isX / hasX / canX` → boolean
  * `executeX / createX / saveX` → commands

---

### 6.3 Classes

* Classes must:

  * Follow SOLID
  * Prefer composition over inheritance
  * Have ≤ 10 public methods
  * Have ≤ 10 properties
* Interfaces define all external contracts.

---

## 7. Validation and Error Handling

* Validation rules belong to:

  * Value Objects
  * Domain Entities
* Controllers validate input using DTOs (`class-validator`).
* Exceptions:

  * Domain → domain-specific errors
  * Application → use-case errors
  * Infrastructure → technical exceptions
* Global exception filters are mandatory.

---

## 8. Common and Core Modules

### 8.1 Common Module (`@app/common`)

Contains **only reusable cross-cutting concerns**:

* Configs
* Decorators
* Guards
* Interceptors
* Shared DTOs
* Validators
* Utilities
* Shared services

No domain logic is allowed here.

---

### 8.2 Core Module

* Global exception filters
* Global interceptors
* Global guards
* Global middlewares

---

## 9. Testing Rules (Mandatory)

* Use **Jest** only.
* Follow:

  * **Arrange – Act – Assert** (unit tests)
  * **Given – When – Then** (acceptance tests)
* Requirements:

  * Unit tests for **every public method**
  * Acceptance tests for **every module**
  * End-to-end tests for **every API module**
* Dependencies must be mocked via interfaces.
* No real infrastructure in unit tests.

---

## 10. Absolute Prohibitions

The following are **strictly forbidden**:

* TODO / FIXME / stubs / placeholders
* God services or god modules
* Cross-module internal imports
* Anemic domain models
* Business logic in controllers
* `any`
* `new` in domain or application layers
* Skipping tests

---

## Final Statement

If a solution violates **any** of these rules, it is considered **incorrect and unacceptable**, even if it “works”.

---

