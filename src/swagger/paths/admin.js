/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin related endpoints
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: API endpoint for admin login
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ttj@duck.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     description: API endpoint to create a new admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "name"
 *               email:
 *                 type: string
 *                 example: "exam@gmail"
 *               phone:
 *                 type: string
 *                 example: "7928372882"
 *               password:
 *                 type: string
 *                 example: "exam123"
 *     responses:
 *       200:
 *         description: Admin created successfullyy
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get an admin
 *     description: API endpoint to get an existing admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin retrieved successfullyy
 *       404:
 *         description: Admin not found
 */

/**
 * @swagger
 * /admin/list:
 *   get:
 *     summary: Get a list of admins
 *     description: Retrieves a paginated list of admins with optional filtering by status.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter admins by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of admins per page (defaults to 10)
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of admins
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/profile/{id}:
 *   get:
 *     summary: Get a Admin by ID
 *     description: Retrieves a admin's details based on the provided admin ID. Access is restricted based on permissions.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the admin to retrieve
 *         schema:
 *           type: string
 *           example: "6123abc456def7890ghi1234"
 *     responses:
 *       200:
 *         description: Admin found successfullyy
 *       400:
 *         description: Admin ID is missing
 *       403:
 *         description: Forbidden, admin lacks permissions
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/profile/{id}:
 *   put:
 *     summary: Update an existing admin
 *     description: API endpoint to update an existing admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "name"
 *               email:
 *                 type: string
 *                 example: "exam@gmail"
 *               phone:
 *                 type: string
 *                 example: "7928372882"
 *               password:
 *                 type: string
 *                 example: "exam123"
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Admin not found
 */

/**
 * @swagger
 * /admin/profile/{id}:
 *   delete:
 *     summary: Delete an existing admin
 *     description: API endpoint to delete an existing admin by their unique identifier
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the admin to be deleted
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/list:
 *   get:
 *     summary: Get a list of admins
 *     description: Retrieves a paginated list of admins with optional filtering by status.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter admins by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of admins per page (defaults to 10)
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of admins
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /admin/log:
 *   get:
 *     summary: Retrieve all logs
 *     description: Fetch all logs with details about associated admin and project, if available.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logs retrieved successfully
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       admin:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john.doe@example.com
 *                       project:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: Project Alpha
 *                       host:
 *                         type: string
 *                         example: localhost
 *                       agent:
 *                         type: string
 *                         example: Mozilla/5.0
 *                       oldIssuedQtyAss:
 *                         type: number
 *                         example: 5
 *                       oldIssuedDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-21T10:00:00.000Z
 *                       oldConsumedQty:
 *                         type: number
 *                         example: 3
 *                       newIssuedQtyAss:
 *                         type: number
 *                         example: 10
 *                       newIssuedDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-22T12:00:00.000Z
 *                       newConsumedQty:
 *                         type: number
 *                         example: 8
 *                       description:
 *                         type: string
 *                         example: Updated project log details
 *                       areaLineSheetIdent:
 *                         type: string
 *                         example: ALSI-12345
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-20T10:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-21T15:00:00.000Z
 *       404:
 *         description: No logs found
 *       500:
 *         description: Internal server error
 */
