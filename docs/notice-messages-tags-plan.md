OVERVIEW

This document describes what needs to be achieved to finalize the Admin Messages and Notices system.
It is written for an experienced developer.
The goal is to clearly define the target behavior and constraints, while leaving technical implementation details and tradeoffs to the developer.

This is NOT a step-by-step instruction list.
It is a contract describing what the system must do when finished.

CONTEXT

The system handles administrative messages that can appear as:
- inbox items
- banners on specific screens
- push notifications

Messages are created in the admin interface and consumed by the mobile app.
Tagging, language rules, audience targeting, and publish behavior must be consistent, predictable, and enforced in the backend.

The system is in a late-stage stabilization phase.
Correctness, clarity, and removal of legacy behavior are prioritized over backward flexibility.

TARGET TAG MODEL

The canonical set of tags in the system must be:

- hitno
- promet
- kultura
- opcenito
- vis
- komiza

Deprecated tags must no longer be usable anywhere in the system:
- they must not appear in admin UI
- they must not be accepted by backend validation
- they must not be referenced in frontend or mobile code

Existing data that uses deprecated tags must be handled safely so the system remains functional.

TAG SEMANTICS

Tags serve two distinct purposes:
- categorization
- audience targeting

Categorization tags:
- promet
- kultura
- opcenito

These may be used on non-urgent messages to improve inbox clarity and iconography.
Non-urgent messages may have up to two categorization tags.

Urgency:
- hitno marks a message as urgent
- hitno messages must always have exactly one additional context tag

Municipality targeting:
- vis and komiza are municipality tags
- municipality tags are only allowed on urgent messages
- municipality tags must never appear on non-urgent messages
- municipality tags are mutually exclusive

In effect:
- municipal messages only exist as urgent messages
- non-urgent messages are always global

DATABASE AND TYPES

The database schema must fully support the canonical tag set.
There must be no mismatch between:
- database enums
- backend types
- admin types
- mobile types

It must not be possible for the application to accept a tag value that the database cannot store.

LANGUAGE RULES

Language requirements depend on whether a message is municipal.

- non-municipal messages must always include both HR and EN content
- municipal messages may omit EN content

This rule must be enforced in the backend.
The admin UI should reflect this rule clearly and immediately based on selected tags.

AUDIENCE AND VISIBILITY

Audience targeting rules must be unambiguous.

- visitors never see municipal messages
- local users always have a municipality selected
- local users see municipal messages only for their municipality
- local users must not exist without a municipality

The onboarding flow must enforce municipality selection when local mode is chosen.
The backend should not need to handle a local user without municipality.

BANNERS

Banners are a special rendering of urgent messages.

A message may appear as a banner only if:
- it is urgent
- it has exactly one context tag
- it has a defined active time window
- the current time is within that window
- the user passes audience eligibility

Banner placement rules:
- home supports all context tags
- events supports kultura only
- transport supports promet only

Banner scheduling is independent of publish timing.

PUBLISHING MODEL

Messages must support a draft and published state.

- draft messages are not visible to users
- published messages are visible in inbox and eligible for banners
- publishing is an explicit action

Publishing is the moment when:
- the message becomes publicly visible
- push notification eligibility is evaluated

PUSH NOTIFICATIONS

Push notifications must be tied to publishing, not to time windows.

- push is evaluated and sent on publish
- only urgent messages may trigger push
- once a push is sent, the message becomes locked from further edits

Banner display remains governed by the active time window regardless of when the push was sent.

AUDIT AND TRACEABILITY

Administrative actions must leave a clear audit trail.

At minimum, the system should record:
- who created a message
- who published a message
- who triggered a push notification

This information should be derived from the admin authentication context.

IMPLEMENTATION EXPECTATIONS

The developer is expected to:
- propose a clean, minimal implementation strategy
- identify the safest way to handle deprecated tags and existing data
- avoid duplicated validation logic where possible
- keep the backend as the final authority for rules
- ensure admin and mobile UIs align with backend constraints

The work should be split into logical, reviewable units.
High-risk changes should be isolated and verified early.
Backward compatibility should not override correctness unless explicitly required.

SUCCESS CRITERIA

When complete:
- tag behavior is consistent and predictable
- invalid combinations are impossible to create
- language requirements are enforced correctly
- publishing and push behavior is intuitive and auditable
- there is no legacy or dead tag logic remaining in active code paths
- the system can be reasoned about without tribal knowledge
