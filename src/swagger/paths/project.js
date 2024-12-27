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


/**
 * @swagger
 * /project/create:
 *   post:
 *     summary: Create a project and upload an Excel file
 *     description: Creates a project and uploads an Excel file to associate its content with the project, saving the data to the database.
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
 *                 description: The Excel file to be uploaded.
 *               projectName:
 *                 type: string
 *                 description: The name of the project to create.
 *               description:
 *                 type: string
 *                 description: A brief description of the project.
 *               createdBy:
 *                 type: string
 *                 format: uuid
 *                 description: The user ID of the person creating the project.
 *             required:
 *               - file
 *               - projectName
 *               - createdBy
 *     responses:
 *       201:
 *         description: Project created and Excel file uploaded and data saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project created and Excel file uploaded/processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: number
 *                       example: 5
 *                     inserted:
 *                       type: number
 *                       example: 3
 *       400:
 *         description: No file uploaded, project data missing, or file contains insufficient data.
 *       403:
 *         description: Unauthorized user to create a project.
 *       500:
 *         description: Internal Server Error.
 */
