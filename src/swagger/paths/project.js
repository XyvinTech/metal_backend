/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project related endpoints
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

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Bulk upload data and create project
 *     description: Uploads an Excel file for bulk data and creates a new project if not provided.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing data for bulk upload.
 *               project:
 *                 type: string
 *                 description: Project Name (optional, creates a new project if not provided).
 *               code:
 *                 type: string
 *                 description: Unique project code (required if creating a new project).
 *               description:
 *                 type: string
 *                 description: Detailed description of the project (required if creating a new project).
 *               owner:
 *                 type: string
 *                 description: Owner of the project (required if creating a new project).
 *               consultant:
 *                 type: string
 *                 description: Consultant for the project (required if creating a new project).
 *     responses:
 *       201:
 *         description: Project created successfully and data uploaded/updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       type: object
 *                       description: The newly created project details.
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "1234567890abcdef"
 *                         code:
 *                           type: string
 *                           example: "PROJECT001"
 *                         description:
 *                           type: string
 *                           example: "This is a new project description."
 *                         owner:
 *                           type: string
 *                           example: "John Doe"
 *                         consultant:
 *                           type: string
 *                           example: "Jane Smith"
 *       400:
 *         description: Bad Request (e.g., invalid input, no file uploaded).
 *       403:
 *         description: Unauthorized (e.g., not a superAdmin).
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /project/test:
 *   post:
 *     summary: Bulk upload data and create a project
 *     description: Upload an Excel file containing data for bulk creation of a project. Extracts headers from the file and dynamically creates a schema for data storage.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file to upload
 *               project:
 *                 type: string
 *                 description: Project Name (optional, creates a new project if not provided).
 *               pk:
 *                 type: string
 *                 description: Project Name (optional, creates a new project if not provided).
 *               code:
 *                 type: string
 *                 description: Unique project code (required if creating a new project).
 *               description:
 *                 type: string
 *                 description: Detailed description of the project (required if creating a new project).
 *               owner:
 *                 type: string
 *                 description: Owner of the project (required if creating a new project).
 *               consultant:
 *                 type: string
 *                 description: Consultant for the project (required if creating a new project).
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Project created successfully
 *                 data:
 *                   type: object
 *                   description: Details of the created project
 *       400:
 *         description: Invalid input or file missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       403:
 *         description: Unauthorized action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You are not authorized to create Project
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: [Error message]"
 */