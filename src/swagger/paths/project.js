/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project related endpoints
 */

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project with the provided details.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 example: "Tech Revamp"
 *               code:
 *                 type: string
 *                 example: "TR2024"
 *               description:
 *                 type: string
 *                 example: "A project to revamp the technology infrastructure."
 *               owner:
 *                 type: string
 *                 example: "John Doe"
 *               consultant:
 *                 type: string
 *                 example: "Jane Smith"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /project/list:
 *   get:
 *     summary: Get all projects
 *     description: Retrieves a list of all projects.
 *     tags:
 *       - Projects
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /project/single/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Retrieves a project by its ID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /project/single/{id}:
 *   put:
 *     summary: Update a project
 *     description: Updates a project with the provided details.
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the project to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 example: "Tech Revamp Updated"
 *               code:
 *                 type: string
 *                 example: "TR2024-U"
 *               description:
 *                 type: string
 *                 example: "An updated project description."
 *               owner:
 *                 type: string
 *                 example: "John Doe"
 *               consultant:
 *                 type: string
 *                 example: "Jane Smith"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /project/single/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project by its ID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the project to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */



/**
 * @swagger
 * /project/single/{id}:
 *   put:
 *     summary: Update a project
 *     description: Updates a project with the provided details.
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the project to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 example: "Tech Revamp Updated"
 *               code:
 *                 type: string
 *                 example: "TR2024-U"
 *               description:
 *                 type: string
 *                 example: "An updated project description."
 *               owner:
 *                 type: string
 *                 example: "John Doe"
 *               consultant:
 *                 type: string
 *                 example: "Jane Smith"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /project/single/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project by its ID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the project to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal Server Error
 */