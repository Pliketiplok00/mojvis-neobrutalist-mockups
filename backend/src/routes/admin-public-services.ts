/**
 * Admin Public Services Routes
 *
 * CRUD endpoints for public services (admin panel).
 *
 * Endpoints:
 * - GET /admin/public-services - list all services (including inactive)
 * - GET /admin/public-services/:id - single service
 * - POST /admin/public-services - create service
 * - PATCH /admin/public-services/:id - update service
 * - DELETE /admin/public-services/:id - soft delete service
 * - POST /admin/public-services/:id/restore - restore deleted service
 * - PUT /admin/public-services/reorder - reorder services
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getAllPublicServices,
  getPublicServiceById,
  createPublicService,
  updatePublicService,
  deletePublicService,
  restorePublicService,
  reorderPublicServices,
} from '../repositories/public-service.js';
import type {
  CreatePublicServiceInput,
  UpdatePublicServiceInput,
} from '../types/public-service.js';

interface CreateServiceBody extends CreatePublicServiceInput {}

interface UpdateServiceBody extends UpdatePublicServiceInput {}

interface ReorderBody {
  orderedIds: string[];
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function adminPublicServicesRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /admin/public-services
   *
   * List all public services (including inactive, for admin).
   */
  fastify.get('/admin/public-services', async (_request, reply) => {
    console.info('[Admin] GET /admin/public-services');

    try {
      const services = await getAllPublicServices(false); // Include inactive
      return reply.status(200).send({
        services,
        total: services.length,
      });
    } catch (error) {
      console.error('[Admin] Error fetching public services:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /admin/public-services/:id
   *
   * Get single public service by ID.
   */
  fastify.get<{
    Params: { id: string };
  }>('/admin/public-services/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] GET /admin/public-services/${id}`);

    try {
      const service = await getPublicServiceById(id);

      if (!service) {
        return reply.status(404).send({ error: 'Service not found' });
      }

      return reply.status(200).send(service);
    } catch (error) {
      console.error(`[Admin] Error fetching public service ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/public-services
   *
   * Create a new public service.
   */
  fastify.post<{
    Body: CreateServiceBody;
  }>('/admin/public-services', async (request, reply) => {
    console.info('[Admin] POST /admin/public-services');

    try {
      const input = request.body;

      // Validate required fields
      if (!input.type || !input.title_hr || !input.title_en || !input.icon || !input.icon_bg_color) {
        return reply.status(400).send({
          error: 'Missing required fields: type, title_hr, title_en, icon, icon_bg_color',
        });
      }

      // Validate type
      if (input.type !== 'permanent' && input.type !== 'periodic') {
        return reply.status(400).send({
          error: 'Invalid type. Must be "permanent" or "periodic"',
        });
      }

      const service = await createPublicService(input);
      return reply.status(201).send(service);
    } catch (error) {
      console.error('[Admin] Error creating public service:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /admin/public-services/:id
   *
   * Update an existing public service.
   */
  fastify.patch<{
    Params: { id: string };
    Body: UpdateServiceBody;
  }>('/admin/public-services/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] PATCH /admin/public-services/${id}`);

    try {
      const input = request.body;

      // Validate type if provided
      if (input.type && input.type !== 'permanent' && input.type !== 'periodic') {
        return reply.status(400).send({
          error: 'Invalid type. Must be "permanent" or "periodic"',
        });
      }

      const service = await updatePublicService(id, input);

      if (!service) {
        return reply.status(404).send({ error: 'Service not found' });
      }

      return reply.status(200).send(service);
    } catch (error) {
      console.error(`[Admin] Error updating public service ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /admin/public-services/:id
   *
   * Soft delete a public service.
   */
  fastify.delete<{
    Params: { id: string };
  }>('/admin/public-services/:id', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] DELETE /admin/public-services/${id}`);

    try {
      const success = await deletePublicService(id);

      if (!success) {
        return reply.status(404).send({ error: 'Service not found' });
      }

      return reply.status(200).send({ success: true });
    } catch (error) {
      console.error(`[Admin] Error deleting public service ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * POST /admin/public-services/:id/restore
   *
   * Restore a soft-deleted public service.
   */
  fastify.post<{
    Params: { id: string };
  }>('/admin/public-services/:id/restore', async (request, reply) => {
    const { id } = request.params;

    console.info(`[Admin] POST /admin/public-services/${id}/restore`);

    try {
      const success = await restorePublicService(id);

      if (!success) {
        return reply.status(404).send({ error: 'Service not found' });
      }

      return reply.status(200).send({ success: true });
    } catch (error) {
      console.error(`[Admin] Error restoring public service ${id}:`, error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * PUT /admin/public-services/reorder
   *
   * Reorder public services.
   */
  fastify.put<{
    Body: ReorderBody;
  }>('/admin/public-services/reorder', async (request, reply) => {
    console.info('[Admin] PUT /admin/public-services/reorder');

    try {
      const { orderedIds } = request.body;

      if (!Array.isArray(orderedIds)) {
        return reply.status(400).send({ error: 'orderedIds must be an array' });
      }

      await reorderPublicServices(orderedIds);
      return reply.status(200).send({ success: true });
    } catch (error) {
      console.error('[Admin] Error reordering public services:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
