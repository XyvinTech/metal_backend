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
 * /project/upload:
 *   post:
 *     summary: Upload an Excel file
 *     description: Uploads an Excel file, associates its content with a project ID, and saves the data to the database.
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
 *               project:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the project to associate the data with.
 *             required:
 *               - file
 *               - project
 *     responses:
 *       201:
 *         description: Excel file uploaded and data saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Excel file uploaded and data saved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         format: uuid
 *                       project:
 *                         type: string
 *                         format: uuid
 *                       unit:
 *                         type: string
 *                       lineNo:
 *                         type: string
 *                       lineLocation:
 *                         type: string
 *                       areaLineSheetIdent:
 *                         type: string
 *                       area:
 *                         type: string
 *                       line:
 *                         type: string
 *                       sheet:
 *                         type: number
 *                       identCode:
 *                         type: string
 *                       uom:
 *                         type: string
 *                       size:
 *                         type: number
 *                       sizeTwo:
 *                         type: number
 *                       specCode:
 *                         type: string
 *                       shortCode:
 *                         type: string
 *                       cat:
 *                         type: string
 *                       shortDesc:
 *                         type: string
 *                       mtoRev:
 *                         type: string
 *                       sf:
 *                         type: string
 *                       scopeQty:
 *                         type: number
 *                       issuedQtyAss:
 *                         type: number
 *                       issuedDate:
 *                         type: string
 *                         format: date-time
 *                       balToIssue:
 *                         type: number
 *                       consumedQty:
 *                         type: number
 *                       balanceStock:
 *                         type: number
 *       400:
 *         description: No file uploaded, project ID missing, or file contains insufficient data.
 *       500:
 *         description: Internal Server Error.
 */
